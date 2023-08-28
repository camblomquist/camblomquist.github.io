+++
title = "At My Limit: A Story About Clamping"
description = "A short rabbit hole from a poorly named function"
date = 2023-08-28
+++

The other day, I was spelunking and found a simple function with a peculiar implementation[^limit]:
<!-- more -->

```cpp
double limit(double x, double low, double high) {
    return ((x < std::min(low,high)) ? std::min(low,high) :
        ((x > std::max(low,high)) ? std::max(low,high) : x));
}
```

[^limit]: You might recognize this by another name: `clamp`.[^clamp] The choice to use the name `limit` instead will bother me to the end of time.

[^clamp]: I later found that `clamp` exists in the same header, implemented two years after `limit`. Presumably because someone was looking for it and couldn't find it because it was called `limit`.

This function tries to be clever with its implementation by avoiding a swap of `low` and `high` if the arguments to the function were somehow mixed up. But its attempted cleverness makes it harder to read. Not only is it harder to read, it's harder for the compiler to properly optimize this function. Throwing the function into [Godbolt](https://godbolt.org/#z:OYLghAFBqd5QCxAYwPYBMCmBRdBLAF1QCcAaPECAMzwBtMA7AQwFtMQByARg9KtQYEAysib0QXACx8BBAKoBnTAAUAHpwAMvAFYTStJg1DIApACYAQuYukl9ZATwDKjdAGFUtAK4sGe1wAyeAyYAHI%2BAEaYxCBmAJykAA6oCoRODB7evnrJqY4CQSHhLFEx8baY9vkMQgRMxASZPn5cFVXptfUEhWGR0bEJCnUNTdmtQ109xaUDAJS2qF7EyOwc5gDMwcjeWADUJutuYsAkhAgsB9gmGgCC1zfoixH0u7R4LIRcEI9ez5i7qlIux%2Bf1eqAA7kCQS8EHhgAhZvsAOxWW67dG7YiYAhLBi7KCqfaHXZDdAgEAfBgQWgQ0iw%2BGzREHABiJIIZIpwWptPpCN2IHuGKF%2BIghMubI5LCYqm5kN5jKJrNJ5KlMppcrhfJAAMZB1RdyRABF7vdof83h8CGZvk8XoDgbbzbSHb8YZqmSjBRi8FR8eqidhdvLkfrhRizbsCJgWIkiYaweC9V6w/6DvHeUm0WGg5q45Ho4lMzchSYjcndj78WLieqPaHs1iccQ8eqiyWy1n0ZUlBXfaKAzmGSHy0LG7jBwg2xjS8bO7tu/9S/Ww2PmwCp%2BiZyaO3dbhGLYR1jbXf97fvnRHg0vy5XZQPg8qQApwUxErKgfKN5jsePH5SILyQJ/tK746rMRZbrcpqOq87yEJIx6gmeMHqlCMFXp6c63qm6yBg%2B7Lks%2Br6gZ%2B6zLt%2BTZ4o%2B2ysG%2B9qoRO4Fkdus67g8KFwQQACsiF2mhJ4JvxoIYeR2EQve7oSoRL5vgxpHkaueLVm4CaKqp2q8kSKnVqymnaqoEFGhw8y0JwXG8H4HBaKQqCcG41jWCSizLIuZjrDwpAEJoxnzAA1iAkgaAAdBoAAcXBInEcRcXEXAaBoZgaJIABs%2BicJIFneTZnC8AoIAaJ53nzHAsBIGgMZ0NE5CUOViSVTE9QsAAbqFAC0NFGFwyXxaQWBNXgKwAGp4Jg4IAPKJIwnAeTQtBRsQeUQBEWURME9QAJ7Tbwq3MMQ61jRE2iYA4W2kOVbCCGNDC0JtVm8FgEReMARy0LQeXcPd0aGMA4h3b1eBYg4eBNZg73WZgqjHV4UancEUamX9bwRMQG0eFgWUEMQ7xbfMVAGMACjDaNE1TR9MiCCIYjsFI5PyEoahZborQGEYKAOZY%2Bh4BEeWQPMqCJNU72tWNZi8KgIPEFjWA8xA8x2Md1QuAw7ieM0sTrKQgTBL0JT9FwCS5GkAijH4blJCkRsMFMfQxPrbQKx0wyNKr2Rm/LQMCJ0DTW7rtuDE7Jvq7YTs%2BzM%2Bty85KwSCZZmZX9tkcLsjUta1TC7B1wC7F1IUhfiuCECQ%2BxuVwsy8F5d3FWVqAVfQZAUBAtX1SAjXJZIwBcO5BV9QNmBE%2BNk2WTNdDzYty1/TtG2nRPe0HUdJ1k%2BdjAEFdN1ZQ9T0vW9p1YFKRi/dZ%2BCA44INg7wENQzDZNw5UWVIyje1o6s1mY9jH24/jhMjf3pMzbIlPiDTfgghFAqHUH9XQZh9DfTZpYawnNubwD5gLdIQsRa7FalKZYk51iGmTm1JgYsJZS1Bog%2B2Hs/AQFcIHdymtlah36EiVKhtqjUNaMw9I9CYiMLIdUL2zssh%2BBoe7XhIdtbTAYalCYIwXaCPGKIooNsQCMIjksKOJc0ocHMqQSy1kE67BuAAJQALKt12MAZAyAs7rCClwXOEB85EGIEXdypdCoVz8iAGKQVYqhUSklMKUVIpcWkAjDK2isoJ1ynocuWhGQaNFuE%2BOOU3GxPmBLVIzhJBAA) using the armv8-a clang 16.0 compiler with `-O2`, we get the following assembly:

```asm
limit(double, double, double):
    fcmp    d2, d1
    fcsel   d3, d2, d1, mi
    fcmp    d3, d0
    b.gt    .LBB0_3
    fcmp    d1, d2
    fmov    d3, d0
    fcsel   d1, d2, d1, mi
    fcmp    d1, d0
    b.pl    .LBB0_3
    fmov    d3, d1
.LBB0_3:
    fmov    d0, d3
    ret
```

It manages to figure most of it out and replace most of the potential branches with conditional instructions, but there are two places where it decides it must branch instead.

The naive implementation with the same sanity check looks like this[^else]:

```cpp
double limit(double x, double low, double high) {
    if (low > high) 
        std::swap(low, high);
    if (x < low)
        return low;
    else if (x > high)
        return high;
    else
        return x;
}
```

[^else]: The `else` isn't necessary but keeps the returns at the same level of indentation. Jury's out on which style looks nicer.

And it produces the following assembly given the same settings:

```asm
limit(double, double, double):
    fcmp    d1, d2
    fcsel   d3, d1, d2, gt
    fcsel   d1, d2, d1, gt
    fcmp    d3, d0
    fcsel   d2, d3, d0, mi
    fcmp    d1, d0
    fcsel   d0, d1, d2, gt
    ret
```

The naive version is not only easier to read but the compiler recognizes every part of the pattern and is able to optimize it. The branches are removed in favor of conditional instructions and it's able to do the same work in only seven instructions versus the original eleven.

If you really want to be terse, you can still do this in two lines[^poison]:

```cpp
double limit(double x, double low, double high) {
    if (low > high) std::swap(low, high);
    // Pick your poison
    return x < low ? low : high < x ? high : x;
    // return std::min(high, std::max(low, x));
}
```

[^poison]: In either case, the compiler recognizes the pattern and optimizes it. The latter saves three whole characters that we can cash in later.

Or if you have access to C++17, we can simplify this even further[^std]:

```cpp
double limit(double x, double low, double high) {
    if (low > high) std::swap(low, high);
    return std::clamp(x, low, high);
}
```

[^std]: Without the sanity check, calling `std::clamp` with `low > high` results in undefined behavior. While most implementations of `clamp` aren't going to be as paranoid as this one, it feels like a classic C++ move to standardize a worse version of something a decade or two after everyone already wrote their own version for something that should've been part of the standard library in the first place.

The output of either of these functions is effectively the same as the naive version. The final two `fcsel` instructions choose different conditions and rearrange their arguments accordingly.

Curiously enough, I could not get GCC to optimize any of these functions to the level that Clang did and each function has a wildly different assembly. I found this bizarre since Clang produced three nearly identical outputs. I initially thought that I was just missing some compiler option but the handful I tried either didn't change the output or weren't recognized by Godbolt. I'm beginning to think it's likely that GCC decided that relying on branch prediction would be faster than the conditional instructions in practice since the happy path in this function would be a no-op. I would like to dig deeper and know the reason for this discrepency, but I'm at my limit.

The code used in these experiments along with the assembly can be found on [Godbolt](https://godbolt.org/#z:OYLghAFBqd5QCxAYwPYBMCmBRdBLAF1QCcAaPECAMzwBtMA7AQwFtMQByARg9KtQYEAysib0QXACx8BBAKoBnTAAUAHpwAMvAFYTStJg1DIApACYAQuYukl9ZATwDKjdAGFUtAK4sGe1wAyeAyYAHI%2BAEaYxCBmAJykAA6oCoRODB7evnrJqY4CQSHhLFEx8baY9vkMQgRMxASZPn5cFVXptfUEhWGR0bEJCnUNTdmtQ109xaUDAJS2qF7EyOwc5gDMwcjeWADUJutuYsAkhAgsB9gmGgCC1zfoixH0u7R4LIRcEI9ez5i7qlIux%2Bf1eqAA7kCQS8EHhgAhZvsAOxWW67dG7YiYAhLBi7KCqfaHXZDdAgEAfBgQWgQ0iw%2BGzREHABiJIIZIpwWptPpCN2IHuGKF%2BIghMubI5LCYqm5kN5jKJrNJ5KlMppcrhfJAAMZB1RdyRABF7vdof83h8CGZvk8XoDgbbzbSHb8YZqmSjBRi8FR8eqidhdvLkfrhRizbsCJgWIkiYaweC9V6w/6DvHeUm0WGg5q45Ho4lMzchSYjcndj78WLieqPaHs1iccQ8eqiyWy1n0ZUlBXfaKAzmGSHy0LG7jBwg2xjS8bO7tu/9S/Ww2PmwCp%2BiZyaO3dbhGLYR1jbXf97fvnRHg0vy5XZQPg8qQApwUxErKgfKN5jsePH5SILyQJ/tK746rMRZbrcpqOq87yEJIx6gmeMHqlCMFXp6c63qm6yBg%2B7Lks%2Br6gZ%2B6zLt%2BTZ4o%2B2ysG%2B9qoRO4Fkdus67g8KFwQQACsiF2mhJ4JvxoIYeR2EQve7oSoRL5vgxpHkaueLVm4CaKqp2q8kSKnVqymnaqoEFGhw8y0JwXG8H4HBaKQqCcG41jWCSizLIuZjrDwpAEJoxnzAA1iAkgaAAdBoAAcXBInEcRcXEXAaBoZgaJIABs%2BicJIFneTZnC8AoIAaJ53nzHAsBIGgMZ0NE5CUOViSVTE9QsAAbqFAC0NFGFwyXxaQWBNXgKwAGp4Jg4IAPKJIwnAeTQtBRsQeUQBEWURME9QAJ7Tbwq3MMQ61jRE2iYA4W2kOVbCCGNDC0JtVm8FgEReMARy0LQeXcPd0aGMA4h3b1eBYg4eBNZg73WZgqjHV4UancEUamX9bwRMQG0eFgWUEMQ7xbfMVAGMACjDaNE1TR9MiCCIYjsFI5PyEoahZborQGEYKAOZY%2Bh4BEeWQPMqCJNU72tWNZi8KgIPEFjWA8xA8x2Md1QuAw7ieM0sTrKQgTBL0JT9FwCS5GkAijH4blJCkRsMFMfQxPrbQKx0wyNKr2Rm/LQMCJ0DTW7rtuDE7Jvq7YTs%2BzM%2Bty85KwSCZZmZX9tkcLsjUta1TC7B1wC7F1IUhfiuCECQ%2BxuVwsy8F5d3FWVqAVfQZAUBAtX1SAjXJZIwBcO5BV9QNmBE%2BNk2WTNdDzYty1/TtG2nRPe0HUdJ1k%2BdjAEFdN1ZQ9T0vW9p1YFKRi/dZ%2BCA44INg7wENQzDZNw5UWVIyje1o6s1mY9jH24/jhMjf3pMzbIlPiDTfgghFAqHUH9XQZh9DfTZpYawnNubwD5gLdIQsRa7FalKZYk51iGmTm1JgYsJZS1Bog%2B2Hs/AQFcIHdymtlah36EiVKhtqjUNaMw9I9CYiMLIdUL2zssh%2BBoe7XhIdtbTAYalCYIwXaCPGKIooNsQCMIjksKOJc0ocHMqQSy1kE67BuAAJQALKt12MAZAyAs7rCClwXOEB85EGIEXdypdCoVz8iAGKQVYqhUSklMKUVIpcWkAjDK2isoJ1ynocuWhGQaNFuE%2BOOU3GxPmBLVIzhJBAA).
