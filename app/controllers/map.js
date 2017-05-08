import Ember from 'ember';
import {isAjaxError, isNotFoundError} from 'ember-ajax/errors';
import OsmToGeoJson from 'npm:osmtogeojson';

const API_DBPEDIA_URL = 'https://dbpedia.org/sparql';
const API_OVERPASS = 'http://overpass-api.de/api/interpreter';
const DEBUG = false;

export default Ember.Controller.extend({
    lat: 48.856700897217,
    lng: 2.350800037384,
    zoom: 9,
    geoJSON: null,
    ajax: Ember.inject.service(),
    universities: null,

    actions: {

        /**
         *
         * @param osmType
         * @param osmId
         * @param cityName
         * @param lat
         * @param long
         */
        findAllPointsByIdEntity(osmType, osmId, cityName, lat, long) {
            "use strict";
            console.log("LAT LONG",lat, long);
            this.set('lat', lat);
            this.set('long', long);

            this.get('ajax').request(API_OVERPASS, {
                method: 'GET',
                dataType: 'xml',
                data: {
                    data: osmType + '(' + osmId + ');(._;>;);out;'
                }
            }).then((data) => {
                if (DEBUG) {
                    console.debug("findAllPointsByIdEntity: ", data);
                }

                const geojson = new OsmToGeoJson(data);
                this.set('geoJSON', JSON.parse(JSON.stringify(geojson)));
                this.send('findAllUniversitiesByCityDBPedia', cityName);


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

        showArea(geojson) {
            "use strict";
            if (DEBUG) {
                console.debug("showArea geojson: ", geojson);
            }
            this.set('geoJSON', this.geojson);

            return this.geojson;
        },

        /**
         *
         * @param cityName
         * @returns {*|Promise|Promise.<T>}
         */
        findAllUniversitiesByCityDBPedia(cityName) {
            "use strict";
            const query = [
                "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>",
                "PREFIX dbo: <http://dbpedia.org/ontology/>",
                "SELECT ?name, ?univ, ?lat, ?long, ?students, ?website WHERE {",
                "?p rdf:type dbo:Place.",
                "?p rdfs:label ?name.",
                "?u dbo:campus ?p.",
                "?u geo:lat ?lat.",
                "?u geo:long ?long.",
                "?u rdfs:label ?univ",
                "OPTIONAL {?u dbo:numberOfStudents ?students}.",
                "OPTIONAL {?u dbp:website ?website }.",
                "FILTER(LANG(?name) = \"en\").",
                "FILTER(?name = \"" + cityName + "\"@en).",
                "FILTER(LANG(?univ) = \"en\")",
                " }"
            ];

            if (DEBUG) {
                console.debug(query.join(" "));
            }

            this.get('ajax').request(API_DBPEDIA_URL + '?query=' + encodeURIComponent(query.join(" ")) + '&format=json', {
                method: 'GET',
                dataType: 'json'
            }).then((data) => {
                let universities = [];
                for (const element in data.results.bindings) {
                    if (data.results.bindings.hasOwnProperty(element)) {
                        let website = '';
                        let students = '';

                        if (data.results.bindings[element].hasOwnProperty('website')) {
                            website = data.results.bindings[element].website.value;
                        }
                        if (data.results.bindings[element].hasOwnProperty('students')) {
                            students = data.results.bindings[element].students.value;
                        }

                        universities.push({
                            name: data.results.bindings[element].univ.value,
                            coordinates: [data.results.bindings[element].lat.value ,data.results.bindings[element].long.value],
                            website: website,
                            students: students
                        });
                    }
                }
                this.set('universities', universities);

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
    }
});