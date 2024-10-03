---
title: 'Stylus Rust SDK overview'
description: 'An overview of the features provided by the Stylus Rust SDK'
author: jose-franco
sme: jose-franco
sidebar_position: 1
target_audience: Developers using the Stylus Rust SDK to write and deploy smart contracts.
---

import PublicPreviewBannerPartial from '../../partials/_public-preview-banner-partial.mdx';

<PublicPreviewBannerPartial />

This section provides an in-depth overview of the features provided by the [Stylus Rust SDK](https://github.com/OffchainLabs/stylus-sdk-rs). For information about deploying Rust smart contracts, see the `cargo stylus` [CLI Tool](https://github.com/OffchainLabs/cargo-stylus). For a conceptual introduction to Stylus, see [Stylus: A Gentle Introduction](../stylus-gentle-introduction.md). To deploy your first Stylus smart contract using Rust, refer to the [Quickstart](../stylus-quickstart.md).

The Stylus Rust SDK is built on top of [Alloy](https://www.paradigm.xyz/2023/06/alloy), a collection of crates empowering the Rust Ethereum ecosystem. Because the SDK uses the same [Rust primitives for Ethereum types](https://docs.rs/alloy-primitives/latest/alloy_primitives/), Stylus is compatible with existing Rust libraries.

The Stylus Rust SDK has been audited in August 2024 at [commit #62bd831](https://github.com/OffchainLabs/stylus-sdk-rs/tree/62bd8318c7f3ab5be954cbc264f85bf2ba3f4b06) by Open Zeppelin which can be viewed [on our audits page](audit-reports.mdx).

This section contains a set of pages that describe a certain aspect of the Stylus Rust SDK, like how to work with [variables](/stylus-by-example/variables.mdx), or what ways are there to [send ether](/stylus-by-example/sending_ether.mdx). Additionally, there's also a page that compiles a set of [advanced features](/stylus/reference/rust-sdk-guide.md) that the Stylus Rust SDK provides.

Finally, there's also a [Stylus by example](https://stylus-by-example.org) portal available that provides most of the information included in this section, as well as many different example contracts.
