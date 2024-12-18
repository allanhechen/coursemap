import { docs, meta } from "@/../.source";
import { createMDXSource } from "fumadocs-mdx";
import { loader } from "fumadocs-core/source";

export default loader({
    baseUrl: "/docs",
    source: createMDXSource(docs, meta),
});