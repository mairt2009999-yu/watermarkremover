// source.config.ts
import {
  defineCollections,
  defineDocs,
  frontmatterSchema,
  metaSchema
} from "fumadocs-mdx/config";
import { z } from "zod";
var docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema.extend({
      preview: z.string().optional(),
      index: z.boolean().default(false)
    })
  },
  meta: {
    schema: metaSchema
  }
});
var changelog = defineCollections({
  type: "doc",
  dir: "content/changelog",
  schema: frontmatterSchema.extend({
    version: z.string(),
    date: z.string().date(),
    published: z.boolean().default(true)
  })
});
var pages = defineCollections({
  type: "doc",
  dir: "content/pages",
  schema: frontmatterSchema.extend({
    date: z.string().date(),
    published: z.boolean().default(true)
  })
});
var author = defineCollections({
  type: "doc",
  dir: "content/author",
  schema: z.object({
    name: z.string(),
    avatar: z.string(),
    description: z.string().optional()
  })
});
var category = defineCollections({
  type: "doc",
  dir: "content/category",
  schema: z.object({
    name: z.string(),
    description: z.string().optional()
  })
});
export {
  author,
  category,
  changelog,
  docs,
  pages
};
