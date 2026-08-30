import { TagIcon } from "@sanity/icons/Tag";
import { defineField, defineType } from "sanity";

export const guideCategoryType = defineType({
  name: "guideCategory",
  title: "Guide Category",
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
