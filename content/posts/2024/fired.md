+++
title = "Why I was Fired"
description = "A mostly incoherent ramble."
date = 2024-07-18
+++

On Monday, I was let go [^letgo] from my job after two years, four months, and one day. The reason why I was let go is ultimately the same reason why I was forced to resign from the job before that after one year and six months: I was given a project I thought I could handle but could not and did not. Then when faced with fight or flight, I chose freeze. I spent the past seven months in such a way that it looked like I was twiddling my thumbs, haunted all the while about facing the repeat of events that I was desperate to avoid yet feeling powerless to escape my fate.
<!-- more -->

[^letgo]: Fired.

I don't expect any of this to be coherent or well put together, but I need to write and I don't know why. I need to write about why I was let go. About the problems that I face today that I can find myself complaining about in journals from 2017. I've been walking in circles for too long and I desperately wish to escape but find myself unable. I don't think this well help me escape but it'll at least be another journal entry I can look back on in seven years.

Like most problems of this nature, I can see the traces of it throughout my life history. I can remember how I never did my homework in school. How I never did the summer readings. How I once managed to just not write an essay worth one-third of my grade. I did better in college for the most part, I managed to force myself to do things right in a way I couldn't before. The cracks in that started to show in my final years. I once skipped class for a week and ruined my sleep schedule to start and finish a project that we has most of the semester to do.[^project]

[^project]: I submitted the project an hour before the deadline then woke up the next morning to realize I had submitted the wrong file.

I was part of the Game Development Club through which I met some genuine friends. And I regularly let all of them down because I didn't actively work on the projects. It hurt. These were things I *wanted* to do. Why was I avoiding them? Why couldn't I get my act together for things I actually cared about?

I feel like there needs to be a paragraph to bridge the gap between the previous and the next. This is that paragraph.

I started my first job out of college in December of 2019 and went remote in March of 2020. Shortly after, I was given a diagnosis for ADHD and a prescription for 10mg of Adderall. Like medications I took in school for depression, the placebo resulting from the idea of doing something to help worked more than the actual medication. Once the placebo wore off, the dose was steadily increased until I started to feel it in my heart and I said I couldn't take it. I was switched to Effexor, then had Strattera added on for anxiety, then went off both, went back on both, added Vyvanse, then removed Vyvanse when the generic came out because insurance no longer covered it but the generic was still $75 a month. It's hard to say how effective these are at anything other than draining my wallet.

Remote work and ADHD are a bad mix. I regularly found myself giving in to impulse on side projects instead of assigned work. I spent two weeks working on an audio capture plugin for OBS and never finished it.[^obs] At the beginning of my downward spiral, I was forced to take a day off. In that day and the weekend that followed, I started a project to make 3D printed RGB cat ears. I remember getting frustrated about not being able to get the design exactly how I envisioned it. And wanting to cry because of that frustration but also finding myself unable to tear myself away. Unable to get up from my chair and do literally anything else. It wouldn't leave my mind. I could not stop working on it. Until finally I gave up. Another project that takes up space in my mind but will never be finished.

[^obs]: Windows now has API to capture audio from an application, making that project entirely obsolete.

The straw that broke the camel's back was a client project involving a multiplayer mobile game. The client wanted to show how gaming on their new 5G network was better than 4G or something of the sort. I was effectively the only developer on the project. I should have known I wasn't capable of doing it but I wanted to prove that I could. I wanted to make up for my previous mistakes in college. And in the end, I couldn't. I found myself slacking off during the day while pulling all-nighters to make up for lost time. I was constantly missing deadlines and what little work I showed was disappointing to say the least. And then they said enough was enough. I was given the option to resign or be fired and I picked  resign.

When asked about my previous job and why I left, my canned response was that the stress of remote work with a six hour time difference became too much for me to handle.

At the next job, I was regularly frustrated by poorly architectured code and constantly wanted to take time to completely redesign it despite it not being my active assignment. I was worse about my active assignments.

I once lost us a contract because my hubris had me completely rewriting a Python application and that rewrite was worse than the original. I hadn't yet learned about that being [something you should never do](https://www.joelonsoftware.com/2000/04/06/things-you-should-never-do-part-i/). And even when I did learn that lesson, it didn't stick because I still found myself making a new folder for rewriting the ten year old tech stack every time I found reason to be frustrated by it.

I became known as a bit of a C++ guru. I really cared about doing things properly in a language that was very much willing to let the user fail spectacularly. If a coworker had a question about a certain behavior or feature in the language, I was the one to talk to. And I genuinely enjoyed being that person. Unfortunately, this is also how I was assigned the project that would lead to my downfall.

One bit of legacy code that nobody wanted to touch was a coverage path planning library written in something resembling embedded C. Being the language guy, I was tasked with fixing the bugs and expanding functionality. I spent a good amount of time reading through the code and constantly getting frustrated by it. It was a tangled mess of spaghetti code and every small change made would have some unintended repercussion somewhere else. Every bug fixed was another bug added. 

I started reading science papers on alternative algorithms for planning. I spent too much time reading these papers. I once again started doing things I should never do. I wanted to rebuild it from the ground up in a memory-safe language[^safe] so that I wasn't plagued by segmentation faults from code like `a[b[c[d[e]]]]` with `d[e] = -1`. I wanted it to be modular in a way that the previous code felt it could never be. And since this wasn't the primary objective, I couldn't really tell my boss that this was what I was doing.

[^safe]: Of course it was Rust.

And of course during this time, my actual tasks fell by the wayside. I was once again doing less than the minimum and even then it was sloppy. And once again, even though I had these dreams of doing something better, I regularly found myself unable to work on this secret replacement. I kept thinking "I just have to make this a weekend project," and would twiddle my thumbs until the weekend. The weekend would come and go without any progress made on work I should've done during the week. I found myself addicted to online crosswords and sudokus during office hours, paralyzed by the idea of doing actual work and unable to start. Hoping that I would find the energy to do *something* work related during the weekend yet being too exhausted to bother. Because crosswords and sudokus take a lot out of you.

After missed deadlines and client disatisfaction, enough was enough and I was let go. I don't know when my fate was sealed but I'm pretty sure the writing was on the wall for quite a while.

This time feels different from the first in a few ways. First, it truly felt like this could have been my career. I enjoyed the technical challenges of my first job out of college but I could not see myself staying there five years later. In this previous job, I could and wanted to. Despite everything, I enjoyed the work, I enjoyed the people, I felt like my work had actual meaning. I spent $90 on a coffee grinder[^grinder] to take on work trips and was let go before having the chance to use it on one. I had aspirations that I felt were attainable through this job. I had topics I wanted to write essays and blog posts about. I have a draft about spatial data structures that will never see the light of day because it was based on code I no longer have access to. There was a months long saga involving chasing obscure database errors that I'll never be able to write now.

[^grinder]: If I had waited until Prime Day, I could've saved $20. Or $90.

I don't know what's next for me. I suddenly have a lot of time on my hands and opportunities that I'll most likely squander if the past is any indication. I think that posting this is likely to have a few potential employers throw my resume in the trash. And I wouldn't blame them in the slightest. I've struggled with these problems for my entire life and no matter how much I don't try, I still struggle.

Despite everything though, I'm optimistic about my future. I think I need to be.