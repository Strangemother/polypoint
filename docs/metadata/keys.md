# Meta data keys

A File may have YAML meta data within a comment at the top of the file. This allows introspection when using the components through the theatre app.

| name | description |
| --- | --- |
| files | a list of assocated files. Usually relative to the _src_ directory  |
| title | A title for the js (theatre) file |
| doc_readme | A filepath reference to the associated doc. Relative to the _doc_ directory  |
| doc_content | a list of regex paths to reference all the _content_ files. e.g. `point/*.md`. |
| doc_imports | Similar to the _files_, a list of imports used when this file is in the documentation page. Useful for the auto parsing. |