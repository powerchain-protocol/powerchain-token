# Fee Model

PWRC native fee and PowerChain service fee are independent.

## Native Token-2022 fee

```text
250 bps
maximum 1,000,000 PWRC
ceiling rounding
```

## Service fee

Default policy:

```text
250 bps
disabled by default
PWRC settlement
bridge operations only
recipient required before activation
```

A PWRC service-fee payment is a separate Token-2022 transfer. The quote engine
grosses it up so the configured service wallet receives the intended net
service fee after PWRC's native transfer fee.

The service-fee payment never changes the bridge principal or wPWRC backing.
