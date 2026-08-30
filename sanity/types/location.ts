import { TagIcon } from "@sanity/icons/Tag";
import { defineField, defineType } from "sanity";

export const locationType = defineType({
  name: "location",
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
    defineField({
      name: "description",
      type: "text",
    }),
    defineField({
      name: "address",
      type: "url",
    }),
  ],
});
