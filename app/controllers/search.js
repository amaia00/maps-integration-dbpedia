import Ember from 'ember';
import {isAjaxError, isNotFoundError} from 'ember-ajax/errors';

const API_DBPEDIA_URL = 'https://dbpedia.org/sparql';
const API_OSM_NOMINATIM = 'http://nominatim.openstreetmap.org/search/';
const DEBUG = false;

export default Ember.Controller.extend({
    ajax: Ember.inject.service(),
    actions: {

        /**
         *
         * @param cityName
         * @returns {*|Promise|Promise.<T>}
         */
        findEntityOSMOfCity(cityName) {
            "use strict";

            this.get('ajax').request(API_OSM_NOMINATIM + cityName + '?format=json&limit=1&osm_type=R', {
                method: 'GET',
                dataType: 'json'
            }).then((data) => {

                if (DEBUG) {
                    console.debug("findEntityOSMOfCity: ", data);
                }

                this.send('findCenterPointOfCity', data[0].osm_type, data[0].osm_id, cityName);

            }).catch(function (error) {
                if (isNotFoundError(error)) {
                    throw ("isNotFoundError");
                }

                if (isAjaxError(error)) {
                    throw ("isAjaxError");
                }

                // other errors are handled elsewhere
                throw error;
            });
        },

        findCenterPointOfCity(osmType, osmId, cityName) {
            "use strict";

            const query = [
                "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>",
                "PREFIX dbo: <http://dbpedia.org/ontology/>",
                "SELECT ?name, ?univ, ?lat, ?long WHERE {",
                "?p rdf:type dbo:Place.",
                "?p rdfs:label ?name.",
                "?p geo:lat ?lat.",
                "?p geo:long ?long.",
                "FILTER(LANG(?name) = \"en\").",
                "FILTER(?name = \"" + cityName + "\"@en).",
                " }"
            ].join(" ");

            if (DEBUG) {
                console.debug("findCenterPointOfCity", query);
            }

            this.get('ajax').request(API_DBPEDIA_URL + '?query=' + encodeURIComponent(query) + '&format=json', {
                method: 'GET',
                dataType: 'json'

            }).then((data) => {
                if (DEBUG) {
                    console.debug("findCenterPointOfCity lat and long", data.results.bindings[0].lat.value,
                        data.results.bindings[0].long.value);
                }

                if (data.results.bindings[0].hasOwnProperty('lat')) {
                    this.set('lat', data.results.bindings[0].lat.value);
                    this.set('long', data.results.bindings[0].long.value);

                    /* On appel la page du map */
                    this.transitionToRoute('/map/' + osmType + '/' + osmId + '/' + cityName + '/' +
                        data.results.bindings[0].lat.value + '/' + data.results.bindings[0].long.value);
                } else {
                    // TODO: ERROR not found
                    throw ("No data found");
                }

            }).catch(function (error) {
                if (isNotFoundError(error)) {
                    throw ("Not Found Error");
                }

                if (isAjaxError(error)) {
                    throw ("Ajax Error");
                }

                throw error;
            });
        },


    }
})
;
