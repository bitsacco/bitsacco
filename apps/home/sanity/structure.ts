import type { StructureResolver } from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Studio')
    .items([
      S.listItem()
        .title('Pages')
        .child(
          S.list()
            .title('Pages')
            .items([
              S.documentTypeListItem('page').title('Pages'),
              S.documentTypeListItem('tag').title('Tag'),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title('Posts')
        .child(
          S.list()
            .title('Posts')
            .items([
              S.documentTypeListItem('post').title('Posts'),
              S.documentTypeListItem('category').title('Categories'),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title('Authors')
        .child(
          S.list()
            .title('Authors')
            .items([S.documentTypeListItem('author').title('Authors')]),
        ),
      S.divider(),
      S.listItem()
        .title('Partners')
        .child(
          S.list()
            .title('Partners')
            .items([S.documentTypeListItem('partner').title('Partners')]),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) =>
          item.getId() &&
          !['page', 'post', 'category', 'author', 'tag', 'partner'].includes(
            item.getId(),
          ),
      ),
    ])
