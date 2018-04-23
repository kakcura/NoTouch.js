import React from "react";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  InfoWindow
} from "react-google-maps";
import { default as CustomMarker } from "../components/CustomMarker";
const { compose, withProps, withStateHandlers } = require("recompose");

const sampleMarkers = [
  {
    name: "Brennan Bennett",
    profession: "Mechanical engineer",
    latitude: 20.3554841,
    longitude: 7.5730188,
    heartRate: 110
  },
  {
    name: "Ammaarah Wilks",
    profession: "Researcher",
    latitude: 20.3754841,
    longitude: 7.630188,
    heartRate: 70
  }
];

export const Map = compose(
  withStateHandlers(
    () => ({
      isOpen: false
    }),
    {
      onToggleOpen: ({ isOpen }) => () => ({
        isOpen: !isOpen
      })
    }
  ),
  withScriptjs,
  withGoogleMap
)(props => {
  return (
    <GoogleMap
      options={{ mapTypeControl: false, streetViewControl: false }}
      mapTypeId="satellite"
      defaultZoom={12}
      defaultCenter={{ lat: props.mapCenter.lat, lng: props.mapCenter.lng }}
    >
      <div className="noScollbar">
        {true && true
          ? sampleMarkers.map((marker, key) => (
              <CustomMarker
                key={key}
                latitude={parseFloat(marker.latitude)}
                longitude={parseFloat(marker.longitude)}
                name={marker.name}
                profession={marker.profession}
                heartRate={marker.heartRate}
                weight={marker.weight}
                height={marker.height}
              />
            ))
          : "kjashdkjasd"}
      </div>
    </GoogleMap>
  );
});

export default Map;
