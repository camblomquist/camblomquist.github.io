+++
title = "Revisiting Loop Recognition in C++... in Rust"
description = "Cargo Cult Programming"
date = 2025-05-27
updated = 2025-05-28
draft = false
+++

Back in 2011, Google published [a report](https://days2011.scala-lang.org/sites/days2011/files/ws3-1-Hundt.pdf) for Scala Days 2011 comparing the idiomatic implementation of an algorithm in C++, Java, Go, and Scala.[^choices]

Over ten years later, the landscape has changed *significantly*.

<!-- more -->

[^choices]: C++ and Java were logical choices at the time. Go was the fresh hotness at Google. Scala... Scala Days

The [2011 Stack Overflow Survey](https://stackoverflow.blog/2011/01/11/survey-says/)[^survey] (the second ever!) only asked users what languages they were proficient in. Let's pretend for a moment that proficency roughly correlates to popularity. Java leads the four with nearly 32% of respondents claiming some proficiency. C++ is in eighth with just over 26%. Scala gets a measly 0.5%, which puts it all the way into *nineteenth* place. And Go, having been introduced to the public only two years before, only has a single vote. Rust appears to have zero responses, which makes sense considering that it was a pet project until 2009 and wasn't stable until 2015.

[^survey]: The 2011 SO Survey used SurveyMonkey and linked to the results. That link no longer works. I had to download the raw data and crunch the numbers myself. Since I didn't look at all the single-vote responses, it's likely that I missed a few points. It's unlikely that those points will cause any change in place for this comparison.[^top5]

[^top5]: If you're curious about the top 5: SQL 57.4%, JavaScript 50.5%, CSS 48.2%, C# 48.1%, Java 31.9%

The [2024 Stack Overflow Survey](https://survey.stackoverflow.co/2024) asks some more interesting questions. Proficiency is replaced with popularity (languages users have worked with in the past year), and we also get to see which languages are "admired" (languages that users wish to continue using), and "desired" (languages users have not used, but want to). Starting with popularity, Java falls to seventh place with 30.3% of respondents having used it in the past year, C++ is in ninth with 23%, Go reaches a whopping 13.5% for thirteenth place, Rust is actually on the map now at 12.6% and fourteenth place, and Scala gets 2.6% and twenty-sixth place. The results for admired languages paint a slightly different picture. Rust is the most admired language with more than 80% of respondents wanting to use it again. Go sees just over 67%, Scala just over 50%, C++ around 53%, and Java around 48%. It's fair to say that Rust is a new contender to this race.

# The New Contender

As does the paper, we will introduce Rust by regurgitating Wikipedia.

> [Rust](https://en.wikipedia.org/wiki/Rust_(programming_language)) is a general-purpose programming language emphasizing performance, type safety, and concurrency. It enforces memory safety, meaning that all references point to valid memory. It does so without a traditional garbage collector; instead, memory safety errors and data races are prevented by the "borrow checker", which tracks the object lifetime of references at compile time. 

And a quick rundown of core properties matching the beats of the original paper:
- Like C++ and Go, Rust is statically compiled
- Rust is not garbage collected, opting for compile-time verification of memory lifetime through the borrow checker.
- Rust has pointers but deferefencing these pointers is limited to `unsafe` contexts.
- Rust requires statements be terminated with `;`. Lines not terminated with `;` are considered expressions, returning their value.[^statements]
- Rust does not *enforce* a specific coding style but highly encourages it by including `rustfmt` as part of its toolchain.
- Rust has very powerful type inference, making type declarations rare.[^types]
- Rust is *not* object-oriented, though it does feature methods as a syntactic sugar.

[^statements]: It seems odd to put a focus on line terminators as a core property of a language. Putting on the Conspiracy Hat, it feels like there was a plan to shill Go until the benchmark results came out.

[^types]: Since this paper was released, C++ also gained type inference through the `auto` keyword. In some cases, this inference is more powerful than Rust. In others...

With all that out of the way, let's Rewrite It In Rust.

# The Algorithm (The It)

The original paper uses an implementation of a loop recognition algorithm as a benchmark. The description of the algorithm in the original paper was brief, only referencing the relevant papers[^havlak] [^tarjan] and providing an exact copy of the pseudocode.

[^havlak]: Havlak, Paul. (1997). Nesting of Reducible and Irreducible Loops. ACM Trans. Program. Lang. Syst.. 19. 557-567. [10.1145/262004.262005](https://dl.acm.org/doi/10.1145/262004.262005).

[^tarjan]: Tarjan, Robert. (1973). Testing Flow Graph Reducibility. Journal of Computer and System Sciences. 9. 96-107. [10.1145/800125.804040](https://dl.acm.org/doi/10.1145/800125.804040).

What the algorithm actually does is irrelevant to this experiment. The reasons for choosing this algorithm over others is describe in the original paper. But since I was asked to actually describe loop recognition, I will make an attempt.[^better]

[^better]: You are better off reading the Havlak paper.

Control-Flow Graphs are concerned with representing programs as traditional graphs. Each node in the graph, known as a Basic Block, corresponds with any number of statements executed in sequence without branching. An edge then describes the flow from one block of statements to the next which may or may not involve a branch. Havlak describes a loop as "Intuitively... a chunk of code whose execution may repeat without the repetition of any surrounding code." or more precisely as a subgraph of [strongly connected components](https://en.wikipedia.org/wiki/Strongly_connected_component). A *reducible* loop then is defined as one of these subgraphs with only one entry point, making an *irreducible* loop one with multiple entry points. The loop recognition algorithm is concerned with building a tree of these loop subgraphs and determining whether the loop is reducible or irreducible.

Each implementation of the algorithm, according to the paper, largely followed the pseudocode of the algorithm while utilizing the most basic idioms of the language when applicable. This raises the question of what is considered Idiomatic Rust.

## Idiomatic Rust

If the goal is to write an idiomatic implementation of the algorithm in Rust, the place to start is *Safe* Rust.

Rust allows for certain functions and blocks to be considered `unsafe`, which then relaxes some compiler restrictions with the requirement that the developer promises not to break the rules that the compiler was trying to enforce. In the context of the algorithm, this would mainly allow for pointer dereferencing as Safe Rust does not attempt to enforce validity of pointers like it can with references.

This algorithm happens to require a lot of pointers. Graphs tend to be tightly connected and the easy way to connect components is through pointers. Thus some changes to the structure and implementation of the algorithm will be necessary to avoid `unsafe`. Theses changes and the reasoning behind them are described later in the section [Implementing in Safe Rust](#implementing-in-safe-rust)

## Unsafe Rust

As previously mentioned, Safe Rust serves as the starting point for idiomatic Rust but requires changes to the implementation of the algorithm.

What if we allowed `unsafe`?

With Unsafe Rust, the implementation of the algorithm is much closer to that of the pseudocode and the C++ implementation. Careful consideration must be made to ensure that the invariants required by Rust are upheld in this unsafe context. Thankfully, [`miri`](https://github.com/rust-lang/miri)[^rplcs] exists to help verify that those invariants aren't violated.

[^rplcs]: And thanks to the Rust Programming Language Community Server for helping me with fixing the code when miri complained.

# Implementation Notes

This section attempts to hit the same points made by the original paper[^impl]

[^impl]: I deeply regret this decision to mimic the structure of the original paper.

## Data Structures

The original paper claims to have strictly followed the notation of the Havlak paper and that is the reason for the "quirky" non object-oriented code.

This claim is rubbish. The structure of the code very much resembles that of the normal C++ style of the time and chooses C++-isms over pseudocode purity. For example, the choice was made to turn the entire algorithm into a `class` that holds the CFG and LSG as member variables when the Havlak paper passes them as arguments to a free function (which the C++ code still does for the entrypoint).

Thus, the idea of following the pseudocode is ignored and the Rust code attempts to at least partially resemble the style of a typical Rust program.

While the C++ uses `typedef` for every type needed by the algorithm, we instead choose to be explicit with the types in each structure, choosing only to alias the following:

```rs
type Map<K, V> = collections::BTreeMap<K, V>;
type Set<T> = collections::BTreeSet<T>;
```

1\) Safe Rust: In the Safe Rust implementation, the data structures used by the algorithm are defined using stack local variables:
```rs
let mut bbtype = vec![BasicBlockType::NonHeader; size];
let mut non_back_preds = vec![Set::new(); size];
let mut back_preds = vec![Vec::new(); size];
let mut header = vec![0; size];
```
The data structures used by the depth-first search have been put into their own struct so that they can be returned together instead of passing each one into the depth-first search function. This also allows the `is_ancestor` function to be associated with the `Traversal`[^ancestor] 
```rs
struct Traversal {
    nodes: UnionFindSet,
    number: Map<Name, Option<usize>>,
    last: Vec<usize>,
}
```
[^ancestor]: While the C++ may have a stronger resemblance to the pseudocode, it wasn't uncommon at the time to see free functions of the same kind that could've been methods. This is the swinging pendulum of everything tangentially related to OOP.

And `UnionFindSet` is simply a wrapper around the `Vec<UnionFindNode>` so that functions that act on the Set or on multiple Nodes may be associated with the struct.
```rs
struct UnionFindSet(Vec<UnionFindNode>);

#[derive(Clone, Default)]
struct UnionFindNode {
    parent: Option<usize>,
    block: Option<Name>,
    loop_: Option<usize>,
    dfs_number: usize,
}
```

2\) Unsafe Rust: The use of `unsafe` gives us the ability to use pointers. The local stack variables remain the same as before but `Traversal` and `UnionFindNode` change slightly. Note that `UnionFindSet` is no longer required here.

```rs
struct Traversal {
    nodes: Vec<UnionFindNode>,
    number: Map<NonNull<BasicBlock>, Option<usize>>,
    last: Vec<usize>,
}

#[derive(Clone)]
struct UnionFindNode {
    parent: NonNull<UnionFindNode>,
    block: Option<NonNull<BasicBlock>>,
    loop_: Option<NonNull<SimpleLoop>>,
    dfs_number: usize,
}
```

## Enumerations

In both Safe and Unsafe Rust, a plain `enum` can be used. Rust's enums allow for data to be stored with each variant though this functionality is not necessary here.

```rs
#[derive(Clone, Copy, PartialEq, Eq)]
enum BasicBlockType {
    NonHeader,
    ReducibleLoop,
    SelfLoop,
    IrreducibleLoop,
    Dead,
}
```

Note that `Top` and `Last` were not defined as they were in C++ as neither of them were used.

## Iterating over Data Structures

In Rust, the `for` loop exists as a `for in` construct similar to Python. Given some struct that implements `IntoIterator`, the loop will iterate over every element provided by the Iterator until it returns `None`.

Iterating over a list of non-backedges would be written as
```rs
// Step D
for &v in &back_preds[w] {
```

Rust's Iterators also allow for chaining multiple operations over one type of collection and collecting into a different collection. Thus instead of having to iterate over the map of basic blocks to initialize `number`, we can simply write in Safe Rust:
```rs
number: cfg.nodes.keys().map(|&name| (name, None)).collect()
```
or in Unsafe Rust:
```rs
number: cfg.nodes.values().map(|&block| (block, None)).collect()
```

## Type Inference

Rust requires explicit type declarations in `struct` and `fn` definitions. By requiring the explicit type at point of use, types elsewhere can be inferred based on how they are used.
For example:
```rs
fn visit_depth_first(&mut self, cfg: &CFG, node: Name, current: usize) -> usize {
    let mut last_id = current;
```
```rs
traversal.visit_depth_first(cfg, cfg.start_node.unwrap(), 0);
```
The type of `last_id` can be inferred as `usize` because the function definition requires that `current` is `usize`. And the type of the literal `0` passed into the function is inferred to be `usize` for the same reason. No implicit casting or conversion is performed from a different numeric type as would be the case in C++.

## Symbol Binding

Rust has multiple ways to control symbol binding. Visibility can be described at the module level and the crate level (equivalent to a package in other languages).

By default, everything is private to the module and everything within a module is available to the module. That is, a non-public field in one struct in some module may be accessed by a function in that same module even if it is not associated with the struct.

To make a struct, field, or function available outside the module, `pub` is used. Additionally, `pub(crate)` may be used to allow other modules within the same crate access without allowing access outside the crate.

## Member Functions

As with more modern C++ styles and unlike the Google Style of 2011, Rust avoids accessor functions when there is no invariant to maintain. Additionally, Rust lacks constructors and structs can be instantiated by directly providing the fields of the struct. Thus the `BasicBlockEdge` is defined and instantiated as follows with no additional implementation: [^bbe] [^design]
```rs
pub struct BasicBlockEdge {
    _from: Name,
    _to: Name,
}

self.edges.push(BasicBlockEdge {
    _from: from,
    _to: to,
})
```

[^bbe]: The choice to prefix the member variables with `_` is made as it informs the linter that the variables are unused.

[^design]: The C++ implementation let the `BasicBlockEdge` constructor be responsible for adding nodes to the graph if the nodes described by the edge do not exist. This feels like a violation of the Single-Responsibility Principle but it's hard to know if this was just a result of that pendulum swing.

Since this doesn't describe anything about Member Functions, here is an additional example showing how member functions are defined in Rust
```rs
pub struct BasicBlock {
    in_edges: Vec<Name>,
    out_edges: Vec<Name>,
    _name: Name,
}

impl BasicBlock {
    fn new(name: Name) -> Self {
        Self {
            in_edges: Vec::new(),
            out_edges: Vec::new(),
            _name: name,
        }
    }

    fn add_out_edge(&mut self, to: Name) {
        self.out_edges.push(to);
    }

    fn add_in_edge(&mut self, from: Name) {
        self.in_edges.push(from);
    }
}
```

## Implementing in Safe Rust

Hitting each of those bullet points really didn't describe how the Safe Rust implementation differs from the C++ or Unsafe Rust implementation. Let's cover that now.

If a straight translation from the C++ were made while trying to stay in Safe Rust, most of the pointers would be replaced with references. References have an associated lifetime that prevent the user from accessing the reference before or after that lifetime. In many cases, the lifetime can be inferred by the compiler and omitted but when defining structs containing references, those lifetimes must be provided explicitly. While lifetime labels can be descriptive, it is also common to use single letter labels.

```rs
type Map<K, V> = collections::BTreeMap<K, V>;

struct BasicBlock<'a> {
    in_edges: Vec<&'a BasicBlock<'a>>,
    out_edges: Vec<&'a BasicBlock<'a>>,
    name: usize,
}

struct BasicBlockEdge<'a> {
    from: &'a BasicBlock<'a>,
    to: &'a BasicBlock<'a>,
}

struct CFG<'a> {
    nodes: Map<usize, BasicBlock<'a>>,
    edges: Vec<BasicBlockEdge<'a>>,
    start_node: Option<&'a BasicBlock<'a>>,
}
```
Here, we're just saying that all the references must live as long as any other reference we hold.

Next we'll want to add a method to `CFG` that adds a new node to the graph:

```rs
// impl CFG
fn create_node(&mut self, name: usize) -> &BasicBlock {
    let node = self
        .nodes
        .entry(name)
        .or_insert_with(|| BasicBlock::new(name));

    node
}
```

This method returns a reference to the node, whether it already existed or was newly inserted, so that we can use it later.

And we'll also want to be able to add edges to the graph. Like the C++ version, we should create the node if it doesn't exist.[^edge]

```rs
fn add_edge(&mut self, from: usize, to: usize) {
    let from = self.create_node(from);
    let to = self.create_node(to);
    self.edges.push(BasicBlockEdge { from, to });
}
```

[^edge]: I claimed the C++ version violated SRP. I claim it's fine here because the *graph* is responsible for creating the edge and upholding the invariant of edges connecting nodes.

And if we try to build that:

```
error: lifetime may not live long enough
impl<'a> CFG<'a> {
     -- lifetime `'a` defined here

    fn add_edge(&mut self, from: usize, to: usize) {
                - let's call the lifetime of this reference `'1`
        let from = self.create_node(from);
                   ^^^^^^^^^^^^^^^^^^^^^^ argument requires that `'1` must outlive `'a`
```

The compiler can't infer that `self` will last longer than the newly created node. This is easily solvable with an annotation but immediately afterwards, we get another error:

```
error[E0499]: cannot borrow `*self` as mutable more than once at a time
impl<'a> CFG<'a> {
     -- lifetime `'a` defined here

        let from = self.create_node(from);
                   ----------------------
                   |
                   first mutable borrow occurs here
                   argument requires that `*self` is borrowed for `'a`
        let to = self.create_node(to);
                 ^^^^ second mutable borrow occurs here
```

Lifetimes exist in context. `from` has a lifetime of `'a` that only exists in the context of the lifetime of `self`. And as long as `from` exists, it's *also* borrowing from `self`. And Rust doesn't allow something to be borrowed mutably more than once at a time. This is the mighty beast that is the borrow checker. There's plenty of ways we could try to make references work but each attempt will just push the compile error somewhere else. Let's just give up on that now.

So the borrow checker won't allow references to replace pointers. Instead, we must find some way to uniquely identify a block in the graph and safely store that identifier in other blocks.

Thankfully, the original paper already gives us that as a `Name`. In the original paper, the CFG uses this name as the key to a map of all blocks in the graph but it is otherwise left unused. We can make use of this name as a handle.[^indices] And since nodes aren't deleted or moved around in this graph, we don't have to worry about invalidating the handle.[^handle]

[^indices]: [This blogpost](http://smallcultfollowing.com/babysteps/blog/2015/04/06/modeling-graphs-in-rust-using-vector-indices/) goes into greater detail about the idea of using vector indices for handles in a graph if you're interested.

[^handle]: If this was a concern, we could swap out the simple index with a [generational index](https://lucassardois.medium.com/generational-indices-guide-8e3c5f7fd594)

So our modified BasicBlock is as follows:
```rs
pub struct BasicBlock {
    in_edges: Vec<Name>,
    out_edges: Vec<Name>,
    _name: Name,
}
```
And anywhere that would've taken a `BasicBlock *` in the C++ version now takes a `Name`.

What's in a `Name`?
```rs
pub type Name = i32;
```

# Performance Anaylsis

The same benchmark code used for C++ as described by the paper is used in the Rust implementation. Experiments were run on a Raspberry Pi 4, which is not as powerful as the old Pentium IV workstation used by the authors of the paper, but does make results easily reproducible by anyone wanting to run this experiment. 

More specifically, the following was used for testing:
- Raspberry Pi 4 Model B Rev 1.5 8GB
- Raspberry Pi OS Bookworm
- g++ (Debian 12.2.0-14) 12.2.0
- cargo 1.87.0 (99624be96 2025-05-06)
- GNU C Library (Debian GLIBC 2.36-9+rpt2+deb12u9)

And for completeness, here's the output of `uname -a`:
```
Linux raspberryrally 6.6.62+rpt-rpi-v8 #1 SMP PREEMPT Debian 1:6.6.62-1+rpt1 (2024-11-25) aarch64 GNU/Linux
```

The methods used here are just as simple and unscientific as those presented in the paper. Unlike in the original paper, execution time was measured using `time` and memory footprint was observed with `htop`. The method of running each test thrice and using the median value remains unchanged.

Instead of using the original Makefile, a CMake project was created for the C++ code. This was done with the idea that like `cargo`, `cmake` has slightly more sensible defaults for Debug and Release build types than a Makefile whose only options for configuration are `-O0` or `-O2`.

For this experiment, only C++ and Rust are compared.[^others]

[^others]: It would certainly be interesting to see how the JVM and Go runtimes have changed, but I did not want to deal with ensuring compilation of decade-old code in languages I don't use.

## Code Size

Since the original paper ensured that each implementation had similar comments, this experiment attempted to add those same comments where relevant. The license block in the C++ code contributed some amount of lines which were subtracted from the results for a better comparison. There were some places where Rusty idioms were used that may have modified code size, such as the choice to implement `std::fmt::Debug` for `LoopStructureGraph` instead of a simple method like the C++ version's `DumpRec`.[^method] Instead of `wc -l`, this test used [`tokei`](https://github.com/XAMPPRocky/tokei) to get more information on the kinds of lines contributing to the total size.

[^method]: While I have no proof of this, I'd guess that their style guide suggested these methods instead of creating an overload for `operator<<`.

{% figure(class="table", caption="Code Size in [Lines of Code], normalized by lines of actual code to C++")%}
| Benchmark | Total | Code | Comments | Blank | Factor (Code) |
| :-------- | ----: | ---: | -------: | ----: | ------------: |
| C++       |   885 |  573 |      184 |   128 |         1.00x |
| Safe Rust |   609 |  403 |      120 |    86 |         0.70x |
| Unsafe Rust | 660 |  449 |      125 |    86 |         0.78x |
{% end %}

## Compile Times

Here we compare the Debug and Release compile times in C++ and Rust, normalized to the C++ Debug version. By default, Rust's compiler will run multiple jobs and thus multiple threads. Although it doesn't have a major effect in this experiment, cmake was run with `--parallel` as this is more likely in the real world compared to running `cargo` with `-j1`.

For each run, the build directory was removed and then the following functions were run under `time`:
- C++ Debug: `cmake -Bbuild . && cmake --build build --parallel`[^configure]
- C++ Release: `cmake -Bbuild -DCMAKE_BUILD_TYPE=Release . && cmake --build build --parallel`
- Rust Debug: `cargo build`
- Rust Release: `cargo build --release`

[^configure]: The choice to include configure time with the C++ bench may be seen as a controversial one. Since the build directory was cleared before each run and `cargo` does similar work as the configure step of `cmake`, comparing configure *and* build time together felt like the more fair comparison.

{% figure(class="table", caption="Compilation Times in [Seconds], normalized by real time to C++ Dbg") %}
| Benchmark     | Real  | User Time | Sys Time | Factor |
| :------------ | ----: | --------: | -------: | -----: |
| C++ Dbg       | 4.410 |     5.501 |    0.936 |  1.00x |
| C++ Rel       | 5.947 |     9.523 |    0.815 |  1.35x |
| Safe Rust Dbg | 2.616 |     3.966 |    0.572 |  0.59x |
| Safe Rust Rel | 3.512 |     8.663 |    0.437 |  0.80x |
| Unsafe Rust Dbg | 2.828 |   4.365 |    0.663 |  0.64x |
| Unsafe Rust Rel | 3.786 |   8.805 |    0.443 |  0.86x |
{% end %}

## Binary Size

Here, the size of the binaries produced by the build step are compared. The original paper made the point that JAR files do not contain their runtime and as such, are much smaller than the compiled C++ binaries that do. Likewise, Rust binaries tend to be larger as the standard library is statically linked into the executable.[^std]

{% figure(class="table", caption="Binary sizes in [Bytes], normalized to C++ Rel")%}
| Benchmark     | Size    | Factor |
| :------------ | ------: | -----: |
| C++ Dbg       |  256800 |  3.42x |
| C++ Rel       |   75128 |  1.00x |
| Safe Rust Dbg | 5739608 | 76.40x |
| Safe Rust Rel |  528584 |  7.04x |
| Unsafe Rust Dbg | 6225728 | 82.87x |
| Unsafe Rust Rel |  528480 |  7.03x |
{% end %}


[^std]: The size of `libstdc++.so` on the Pi is 2174296B. Without actually testing, it's hard to determine the impact that static linking would have on the C++ binary size. This is left as an exercise to the reader.

## Memory Footprint

Similar to the original paper, benchmarks were run alongside `htop` and memory values were manually read out in the middle of execution. I did not expect this to be a useful test but once the main loop started, memory values were fairly consistent.

{% figure(class="table", caption="Memory Footprint in [MB], normalized to C++ Rel") %}
| Benchmark     | VIRT | RES | Factor (VIRT) | Factor (RES) |
| :------------ | ---: | --: | ------------: | -----------: |
| C++ Dbg       |  181 | 178 |         1.01x |        1.01x |
| C++ Rel       |  180 | 177 |         1.00x |        1.00x |
| Safe Rust Dbg |  156 | 146 |         0.87x |        0.82x |
| Safe Rust Rel |  153 | 143 |         0.85x |        0.81x |
| Unsafe Rust Dbg | 155 | 152 |        0.86x |        0.86x |
| Unsafe Rust Rel | 151 | 147 |        0.84x |        0.83x |
{% end %}

Comparing these results to the original paper, we see a very interesting development. The memory footprint of the C++ Debug build is not much larger than that of the Release build. A far cry from the ~2.8x memory usage in Debug mode from the original paper.

## Run-time Measurements

The notes on benchmarking presented in the original paper still apply here, though some aspects may be less relevant today than back in 2011. In particular, array bounds checking may not be a significant negative due to advancements in branch prediction. Similarly, advancements in caching may mitigate the need for a smaller memory footprint as long as items are close together even if it is still beneficial to keep things small.

Since execution was measured with `time`, user and sys time are also provided though they may not be as valuable as with compile time since the benchmarks are single-threaded.

{% figure(class="table", caption="Execution Times in [Seconds], normalized by real time to C++ Rel") %}
| Benchmark     | Real    | User Time | Sys Time | Factor |
| :------------ | ------: | --------: | -------: | -----: |
| C++ Dbg       | 155.740 |   154.142 |    0.425 |  3.08x |
| C++ Rel       |  50.596 |    49.037 |    0.382 |  1.00x |
| Safe Rust Dbg | 285.973 |   284.169 |    0.401 |  5.65x |
| Safe Rust Rel |  29.027 |    27.011 |    0.408 |  0.57x |
| Unsafe Rust Dbg | 297.327 | 295.359 |    0.403 |  5.88x |
| Unsafe Rust Rel |  24.655 |  22.672 |    0.331 |  0.49x |
{% end %}


# ~~Tunings~~

The original paper described efforts to tune each specific implementation either to avoid slow language features or to make use of faster language features. Each change is described briefly along with a percent improvement to execution time.

I will not be doing that here.

This project has taken much longer than originally anticipated and the scope of the project has changed multiple times. I originally wanted to try to re-implement the original C++ using Modern C++ for comparison as well as a version similar in style to the Safe Rust version. I think that the addition of Unsafe Rust was sufficient here.

# Conclusions

We implemented a well specified compact algorithm in Rust based on questionable C++ code and evaluated the results across the same dimensions specified in the original paper even when those dimensions were questionable as a metric.

We find that the Rust Debug build is significantly slower than the C++ Debug build. The Rust Release build handily beats the C++ in both execution time and memory footprint. When moving to Unsafe Rust, the near identical implementation of the algorithm as the untuned C++ not only beat the C++ but the Safe Rust as well. 

We find that implementation of certain data structures in Safe Rust can require rethinking the layout of those data structures. In some cases, this rethinking may yield performance improvements but that did not appear to happen here.

We found that the original C++ forgot to calculate nesting levels[^calc] required for printing, giving it a slight performance boost compared to implementations that remembered to do the work. This was corrected in relevant tests.

[^calc]: This should also never have been a separate step in the first place. For as much as we talk about encoding invariants, the Googlers never seem to care much for it.

The C++ and Rust code used for these tests can be found [on GitHub](https://github.com/camblomquist/loop-recognition-bench). The publicly available code for the original paper can be found [here](https://github.com/hundt98847/multi-language-bench/tree/master).

# Acknowledgements

I would like to once again thank the RPLCS and its members for helping me fix the unsafe code when it failed miri checks. I would also like to thank members of the Serenity Discord Server for helping me even though this project had nothing to do with writing Discord bots.

I would like to thank Robert Hundt for the original paper that inspired this project despite all my cursings of his name during it.

And Google can go to hell.