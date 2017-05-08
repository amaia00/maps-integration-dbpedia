import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('search', { path: '/' });
  this.route('map', { path: '/map/:osmType/:osmId/:cityName/:lat/:long' });
});

export default Router;
