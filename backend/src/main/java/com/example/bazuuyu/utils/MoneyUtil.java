package com.example.bazuuyu.utils;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class MoneyUtil {
    private MoneyUtil() {}

    public static BigDecimal normalizeVnd(BigDecimal v) {
        if (v == null) return BigDecimal.ZERO;
        return v.setScale(2, BigDecimal.ROUND_HALF_UP);
    }

    public static long toVnpMinorUnits(BigDecimal amount) {
        BigDecimal n =normalizeVnd(amount).movePointRight(2);
        return n.setScale(0, RoundingMode.HALF_UP).longValueExact();
    }
}
