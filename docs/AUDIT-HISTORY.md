# Audit and hardening history

## Architecture correction

The first public version still carried a more direct migration shape. A later audit moved
target writes behind TradingWEB's import receiver and removed DataBridge's service-role
escalation/direct target-database ownership. Regression tests now prevent reintroducing
direct target writes and require explicit migration-administrator authorization.

This correction is visible in `fix: route migrations through the TradingWEB receiver (#2)`.


[Current guide](../README.md)
