import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('dbpedia-marker', 'Integration | Component | dbpedia marker', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{dbpedia-marker}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#dbpedia-marker}}
      template block text
    {{/dbpedia-marker}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
