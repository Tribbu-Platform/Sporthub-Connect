# Catalogo de Eventos de Dominio — SportHub Connect

## Convenciones de nomenclatura

Los eventos de dominio siguen la convencion **Sustantivo + Verbo en Pasado** (ej. `UserRegistered`, `EventCreated`, `BadgeEarned`). 

Cada evento incluye:
- **EventId**: Identificador unico del evento
- **Timestamp**: Momento en que ocurrio
- **CorrelationId**: Para trazabilidad distribuida
- **AggregateId**: Identificador del agregado raiz que genero el evento
- **Payload**: Datos especificos del evento

---

## 1. Eventos de Identity & Users

| Evento | Comando que lo dispara | Payload | Consumidores |
|--------|----------------------|---------|-------------|
| **UserRegistered** | RegisterUser | UserId, Email, AuthProvider, DisplayName, RegisteredAt | Gamification (badge de bienvenida), Notifications (email de verificacion) |
| **ProfileUpdated** | UpdateProfile | UserId, ChangedFields[], UpdatedAt | — (evento informativo, logs) |
| **SkillLevelChanged** | UpdateSkillLevel | UserId, OldLevel, NewLevel, ChangedAt | Gamification (badge de progresion) |
| **UserDeactivated** | DeactivateUser | UserId, Reason, DeactivatedAt | Community (marcar membresias inactivas), Notifications |
| **UserReactivated** | ReactivateUser | UserId, ReactivatedAt | Community (reactivar membresias) |

## 2. Eventos de Community Management

| Evento | Comando que lo dispara | Payload | Consumidores |
|--------|----------------------|---------|-------------|
| **CommunityCreated** | CreateCommunity | CommunityId, Name, SportType, OwnerUserId, CreatedAt | Notifications (confirmacion al owner) |
| **CommunityUpdated** | UpdateCommunity | CommunityId, ChangedFields[], UpdatedAt | — |
| **MemberJoined** | JoinCommunity / AcceptInvitation | CommunityId, MembershipId, UserId, JoinedAt, Role | Gamification (badge de bienvenida a comunidad), Notifications (aviso al admin), Leaderboards (inicializar ranking) |
| **MemberRoleChanged** | ChangeMemberRole | MembershipId, UserId, OldRole, NewRole, ChangedByUserId | Notifications (aviso al miembro) |
| **MemberLeft** | LeaveCommunity / RemoveMember | CommunityId, MembershipId, UserId, LeftAt, Reason | Leaderboards (remover del ranking), Gamification (recalcular retos activos) |
| **MemberBanned** | BanMember | CommunityId, MembershipId, UserId, BannedAt, Reason, BannedByUserId | Leaderboards |
| **SubGroupCreated** | CreateSubGroup | CommunityId, SubGroupId, Name, CreatedByUserId | Notifications (a miembros de la comunidad) |
| **MemberAddedToSubGroup** | AddMemberToSubGroup | SubGroupId, MembershipId, UserId | — |

## 3. Eventos de Event Planning

| Evento | Comando que lo dispara | Payload | Consumidores |
|--------|----------------------|---------|-------------|
| **EventCreated** | CreateEvent | EventId, CommunityId, SubGroupId, Title, EventType, StartTime, EndTime, Location, Capacity, CreatedByUserId | Notifications (push/email a miembros de la comunidad/subgrupo), Feed |
| **EventUpdated** | UpdateEvent | EventId, ChangedFields[], UpdatedAt | Notifications (si cambio fecha/ubicacion a RSVPs) |
| **EventCancelled** | CancelEvent | EventId, CancelledAt, Reason | Notifications (a todos los RSVPs), Gamification (cancelar retos vinculados) |
| **RSVPSubmitted** | SubmitRSVP | RSVPId, EventId, MembershipId, UserId, Response, SubmittedAt | Gamification (si es "Yes": tracking para insignias de asistencia), Notifications (al admin si es "No" de un jugador clave) |
| **RSVPChanged** | ChangeRSVP | RSVPId, OldResponse, NewResponse, ChangedAt | Gamification (ajustar contadores), Notifications (si cambio de "Yes" a "No" tarde) |
| **CheckInRecorded** | RecordCheckIn | CheckInId, EventId, MembershipId, UserId, Method, CheckedInAt | Gamification (otorgar XP por asistencia, disparar reglas de insignias), Leaderboards (actualizar ranking de asistencia), Economy (otorgar SportCoins) |
| **NoShowDetected** | (Automatico: evento finalizo + usuario RSVP "Yes" sin check-in) | EventId, MembershipId, UserId, DetectedAt | Economy (penalizacion de SportCoins si aplica), Gamification (afectar racha de asistencia) |

## 4. Eventos de Gamification

| Evento | Comando que lo dispara | Payload | Consumidores |
|--------|----------------------|---------|-------------|
| **BadgeEarned** | (Automatico: BadgeRule evaluada como verdadera) | UserBadgeId, BadgeId, BadgeName, BadgeTier, UserId, CommunityId, EarnedAt | Notifications (push/email: "Felicidades! Ganaste la insignia X"), Feed, Leaderboards (actualizar score) |
| **XPEarned** | (Automatico: tras CheckIn, Badge, Challenge completion) | XPRecordId, UserId, CommunityId, Amount, Source, SourceId, EarnedAt | Leaderboards (recalcular ranking XP), Economy (bonus de SportCoins si aplica), Feed |
| **LevelUp** | (Automatico: XP acumulado supera threshold de nivel) | UserId, CommunityId, OldLevel, NewLevel, NewTitle, LeveledUpAt | Notifications ("Subiste a nivel X!"), Feed |
| **ChallengeCreated** | CreateChallenge | ChallengeId, CommunityId, Title, StartDate, EndDate, Goal, RewardXP | Notifications (a miembros de la comunidad), Feed |
| **ChallengeJoined** | JoinChallenge | ChallengeId, UserId, JoinedAt | Feed |
| **ChallengeCompleted** | (Automatico: progreso >= meta) | ChallengeId, UserId, CompletedAt, RewardXP, BonusCoins? | Notifications ("Completaste el reto X!"), XP (otorgar reward), Economy (SportCoins), Leaderboards, Feed |
| **ChallengeExpired** | (Automatico: EndDate alcanzada) | ChallengeId, ParticipantsCompleted, ParticipantsIncomplete | Notifications (resultados del reto), Feed |

## 5. Eventos de Leaderboards & Economy

| Evento | Comando que lo dispara | Payload | Consumidores |
|--------|----------------------|---------|-------------|
| **LeaderboardUpdated** | (Automatico: tras recalculo periodico o evento) | LeaderboardId, CommunityId, Period, UpdatedAt | — (evento informativo, puede disparar notificaciones de "top 10") |
| **TopRankAchieved** | (Automatico: usuario entra en top 3) | LeaderboardId, UserId, Rank, Period | Notifications, Feed |
| **CoinsEarned** | AwardCoins | TransactionId, UserId, Amount, Source, ReferenceId | Feed |
| **CoinsSpent** | SpendCoins | TransactionId, UserId, Amount, BenefitId, RedemptionId | — |
| **CoinsPenalized** | PenalizeCoins | TransactionId, UserId, Amount, Reason, ReferenceId (NoShowEvent) | Notifications |
| **BenefitRedeemed** | RedeemBenefit | RedemptionId, UserId, BenefitId, CoinCost, PartnerId, RedeemedAt | Notifications (codigo de redencion), Partner (notificar redencion) |

## 6. Eventos de Payments

| Evento | Comando que lo dispara | Payload | Consumidores |
|--------|----------------------|---------|-------------|
| **SubscriptionCreated** | CreateSubscription | SubscriptionId, CommunityId, Plan, StartedAt, ExpiresAt | Community (activar features Premium), Notifications (bienvenida Premium) |
| **SubscriptionRenewed** | (Automatico: pago recurrente exitoso) | SubscriptionId, CommunityId, NewExpiresAt | Community (mantener Premium) |
| **SubscriptionCanceled** | CancelSubscription | SubscriptionId, CommunityId, CanceledAt, Reason | Community (degradar a Free, features bloqueadas), Notifications |
| **SubscriptionPaymentFailed** | (Webhook Stripe: pago fallido) | SubscriptionId, CommunityId, AttemptNumber, NextRetryAt | Notifications (aviso al dueño de la comunidad) |
| **InvoiceIssued** | GenerateInvoice | InvoiceId, CommunityId, Amount, IssuedAt | Notifications, Community |

## 7. Eventos de Notifications (internos al bounded context)

| Evento | Descripcion |
|--------|-------------|
| **NotificationSent** | Una notificacion fue despachada por el canal correspondiente |
| **NotificationRead** | El usuario marco una notificacion como leida |
| **FeedItemAdded** | Un nuevo item fue añadido al feed de la comunidad |

## 8. Eventos de Integrations

| Evento | Comando que lo dispara | Payload | Consumidores |
|--------|----------------------|---------|-------------|
| **WearableConnected** | ConnectWearable | UserId, Provider, ConnectedAt | Gamification (badge de "Conectado") |
| **WearableDisconnected** | DisconnectWearable | UserId, Provider, DisconnectedAt | — |
| **WearableActivityImported** | (Automatico/Manual: sync wearable) | UserId, Provider, ActivityType, DistanceKm, Duration, StartedAt, ActivityId | Gamification (XP aumentado por actividad verificada), Leaderboards (ranking de distancia), Feed |

---

## Flujos de Procesos (Sagas / Workflows)

### SAGA 1: Flujo de Asistencia Completa

```
1. EventCreated → Notifications (invitar miembros)
2. Member RSVPSubmitted(Yes) → (registro interno)
3. Event.StartTime → (espera)
4. Member CheckInRecorded → Gamification.XPEarned → Leaderboards.LeaderboardUpdated
   Member CheckInRecorded → Gamification.evaluar BadgeRules → BadgeEarned (si aplica)
   Member CheckInRecorded → Economy.CoinsEarned (si evento otorga coins)
5. Event.EndTime → NoShowDetected (para RSVP Yes sin CheckIn) → Economy.CoinsPenalized
```

### SAGA 2: Procesamiento Nocturno de Leaderboards

```
1. Scheduler dispara "RefreshAllLeaderboards" (ej. 02:00 UTC)
2. Para cada comunidad activa:
   - Query XPRecords del periodo
   - Query Badges del periodo
   - Query asistencias del periodo
   - Calcular score compuesto
   - LeaderboardUpdated con nuevos rankings
   - Si hay cambios en top 3: TopRankAchieved
3. Notifications: "Actualizacion semanal de rankings disponibles"
```

### SAGA 3: Ciclo de Vida de un Reto

```
1. ChallengeCreated → Notifications (invitar a participar)
2. Member ChallengeJoined → Feed
3. (Durante el reto) Member genera eventos que incrementan progreso:
   - CheckInRecorded → Challenge.progress += 1 (si reto es de asistencias)
   - XPEarned → Challenge.progress += XP (si reto es de XP total)
   - WearableActivityImported → Challenge.progress += distancia (si reto es de KM)
4. Progreso >= Meta → ChallengeCompleted → XPEarned (reward) + CoinsEarned (bonus) + BadgeEarned (si aplica)
5. EndDate alcanzada → ChallengeExpired → Notifications (resultados finales)
```

### SAGA 4: Upgrade/Downgrade de Plan

```
1. SubscriptionCreated → Community (activar features Premium) + Notifications
2. SubscriptionRenewed → Community (mantener Premium activo)
3. SubscriptionPaymentFailed → Notifications (aviso al Owner)
   - Si 3 intentos fallidos → SubscriptionCanceled → Community (degradar a Free)
4. SubscriptionCanceled → Community (bloquear features Premium, notificar al Owner)
```
