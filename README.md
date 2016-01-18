# mithril-translate
Microlib for translations with support for placeholders and multiple plural forms.


## Usage:

```
 var en_US = {
  translationKey: 'translationValue',
  moduleA: {
    translationKey: 'value123'
  }
 };
```

```
 mx.translate.configure({ debug: false, pluralize: function (n, translKey) { return Math.abs(n); } });  
 mx.translate.language(function () {
   var locale = 'en_US';
   var languages = { 'en_US': en_US };
   return languages[locale];
 });
```

```
 mx.translate('translationKey');
 mx.translate('translationKey', count);
 mx.translate('translationKey', {replaceKey: 'replacevalue'});
 mx.translate('translationKey', count, {replaceKey: 'replacevalue'});
 mx.translate('translationKey', {replaceKey: 'replacevalue'}, count);
 ```
