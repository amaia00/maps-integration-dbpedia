import Ember from 'ember';

export default Ember.Route.extend({
    model(params) {
        "use strict";

        this.controllerFor('map').send('findAllPointsByIdEntity', params.osmType, params.osmId, params.cityName,
            params.lat, params.long);
    }
});
