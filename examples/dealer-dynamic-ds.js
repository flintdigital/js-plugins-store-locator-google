/**
 * @implements storeLocator.DataFeed
 * @constructor
 */
function DealerDataSource() {
}

DealerDataSource.prototype.getStores = function(bounds, features, callback) {
  var that = this;
  var center = bounds.getCenter();
  // var audioFeature = this.FEATURES_.getById('Audio-YES');
  // var wheelchairFeature = this.FEATURES_.getById('Wheelchair-YES');

  var where = '(ST_INTERSECTS(geometry, ' + this.boundsToWkt_(bounds) + ')' +
      ' OR ST_DISTANCE(geometry, ' + this.latLngToWkt_(center) + ') < 20000)';

  // if (features.contains(audioFeature)) {
  //   where += " AND Audio='YES'";
  // }
  // if (features.contains(wheelchairFeature)) {
  //   where += " AND Wheelchair='YES'";
  // }

  var tableId = '12421761926155747447-06672618218968397709';
  var url = 'http://localhost/js-plugins-store-locator-google/examples/data.json?callback=test';

  $.getJSON(url, {
    key: 'AIzaSyAtunhRg0VTElV-P7n4Agpm9tYlABQDCAM',
    where: where,
    version: 'published',
    maxResults: 300
  }, function(resp) {
    var stores = that.parse_(resp);
    that.sortByDistance_(center, stores);
    callback(stores);
  });
};

DealerDataSource.prototype.latLngToWkt_ = function(point) {
  return 'ST_POINT(' + point.lng() + ', ' + point.lat() + ')';
};

DealerDataSource.prototype.boundsToWkt_ = function(bounds) {
  var ne = bounds.getNorthEast();
  var sw = bounds.getSouthWest();
  return [
    "ST_GEOMFROMTEXT('POLYGON ((",
    sw.lng(), ' ', sw.lat(), ', ',
    ne.lng(), ' ', sw.lat(), ', ',
    ne.lng(), ' ', ne.lat(), ', ',
    sw.lng(), ' ', ne.lat(), ', ',
    sw.lng(), ' ', sw.lat(),
    "))')"
  ].join('');
};

DealerDataSource.prototype.parse_ = function(data) {
  var stores = [];
  for (var i = 0, row; row = data.results[i]; i++) {
    var props = row.properties;
    var features = new storeLocator.FeatureSet;
    // features.add(this.FEATURES_.getById('Wheelchair-' + props.Wheelchair));
    // features.add(this.FEATURES_.getById('Audio-' + props.Audio));


        var position = new google.maps.LatLng(row.lat, row.lon);

    var shop = this.join_([row.Shp_num_an, row.Shp_centre], ', ');
    var locality = this.join_([row.city, , row.state, row.zip], ', ');

    var store = new storeLocator.Store(row.ID, position, features, {
      title: row.name,
      address: this.join_([shop, row.address1, row.address2, locality ], '<br>'),
      hours: row.Hrs_of_bus
    });
    stores.push(store);
  }
  return stores;
};

/**
 * @const
 * @type {!storeLocator.FeatureSet}
 * @private
 */
DealerDataSource.prototype.FEATURES_ = new storeLocator.FeatureSet(
  new storeLocator.Feature('Wheelchair-YES', 'Wheelchair access'),
  new storeLocator.Feature('Audio-YES', 'Audio')
);

/**
 * @return {!storeLocator.FeatureSet}
 */
DealerDataSource.prototype.getFeatures = function() {
  return this.FEATURES_;
};


/**
 * Joins elements of an array that are non-empty and non-null.
 * @private
 * @param {!Array} arr array of elements to join.
 * @param {string} sep the separator.
 * @return {string}
 */
DealerDataSource.prototype.join_ = function(arr, sep) {
  var parts = [];
  for (var i = 0, ii = arr.length; i < ii; i++) {
    arr[i] && parts.push(arr[i]);
  }
  return parts.join(sep);
};

/**
 * Sorts a list of given stores by distance from a point in ascending order.
 * Directly manipulates the given array (has side effects).
 * @private
 * @param {google.maps.LatLng} latLng the point to sort from.
 * @param {!Array.<!storeLocator.Store>} stores  the stores to sort.
 */
DealerDataSource.prototype.sortByDistance_ = function(latLng, stores) {
  stores.sort(function(a, b) {
    return a.distanceTo(latLng) - b.distanceTo(latLng);
  });
};
