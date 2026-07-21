using System.Reflection;
using FluentAssertions;
using SportHub.Identity.Domain.Entities;
using SportHub.Identity.Domain.ValueObjects;

namespace SportHub.Identity.UnitTests.Domain.Repositories.IUserRepositoryTests;

public class ContractTests
{
    [Fact]
    public void Should_DefineIUserRepositoryInterface()
    {
        // Arrange --------------------------------------------------------
        var assembly = typeof(User).Assembly;

        // Act ------------------------------------------------------------
        var interfaceType = assembly.GetType("SportHub.Identity.Domain.Repositories.IUserRepository");

        // Assert ----------------------------------------------------------
        interfaceType.Should().NotBeNull("IUserRepository should be defined in Domain");
        interfaceType!.IsInterface.Should().BeTrue();
    }

    [Fact]
    public void Should_HaveGetByIdAsyncMethod()
    {
        // Arrange --------------------------------------------------------
        var interfaceType = GetRepositoryType();

        // Act ------------------------------------------------------------
        var method = interfaceType!.GetMethod("GetByIdAsync");

        // Assert ----------------------------------------------------------
        method.Should().NotBeNull();
        method!.ReturnType.Should().Be<Task<User?>>();
        method.GetParameters().Should().HaveCount(2);
        method.GetParameters()[0].ParameterType.Should().Be<Guid>();
    }

    [Fact]
    public void Should_HaveGetByEmailAsyncMethod()
    {
        // Arrange --------------------------------------------------------
        var interfaceType = GetRepositoryType();

        // Act ------------------------------------------------------------
        var method = interfaceType!.GetMethod("GetByEmailAsync");

        // Assert ----------------------------------------------------------
        method.Should().NotBeNull();
        method!.ReturnType.Should().Be<Task<User?>>();
        method.GetParameters()[0].ParameterType.Should().Be(typeof(EmailAddress));
    }

    [Fact]
    public void Should_HaveAddAsyncMethod()
    {
        // Arrange --------------------------------------------------------
        var interfaceType = GetRepositoryType();

        // Act ------------------------------------------------------------
        var method = interfaceType!.GetMethod("AddAsync");

        // Assert ----------------------------------------------------------
        method.Should().NotBeNull();
        method!.ReturnType.Should().Be<Task>();
        method.GetParameters()[0].ParameterType.Should().Be(typeof(User));
    }

    [Fact]
    public void Should_HaveUpdateAsyncMethod()
    {
        // Arrange --------------------------------------------------------
        var interfaceType = GetRepositoryType();

        // Act ------------------------------------------------------------
        var method = interfaceType!.GetMethod("UpdateAsync");

        // Assert ----------------------------------------------------------
        method.Should().NotBeNull();
        method!.ReturnType.Should().Be<Task>();
        method.GetParameters()[0].ParameterType.Should().Be(typeof(User));
    }

    [Fact]
    public void Should_HaveExistsByEmailAsyncMethod()
    {
        // Arrange --------------------------------------------------------
        var interfaceType = GetRepositoryType();

        // Act ------------------------------------------------------------
        var method = interfaceType!.GetMethod("ExistsByEmailAsync");

        // Assert ----------------------------------------------------------
        method.Should().NotBeNull();
        method!.ReturnType.Should().Be<Task<bool>>();
        method.GetParameters()[0].ParameterType.Should().Be(typeof(EmailAddress));
    }

    private static Type? GetRepositoryType()
    {
        var assembly = typeof(User).Assembly;
        return assembly.GetType("SportHub.Identity.Domain.Repositories.IUserRepository");
    }
}
