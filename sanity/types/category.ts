import { TagIcon } from "@sanity/icons/Tag";
import { defineField, defineType } from "sanity";

export const categoryType = defineType({
  name: "category",
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
