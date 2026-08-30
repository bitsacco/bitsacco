import { TagIcon } from "@sanity/icons/Tag";
import { defineField, defineType } from "sanity";

export const tagType = defineType({
  name: "tag",
  type: "document",

  icon: TagIcon as any,
  fields: [
    defineField({
      name: "title",
      type: "string",
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: {
        source: "title",
      },
    }),
  ],
});
