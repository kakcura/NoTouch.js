import React, { Component } from 'react';

class MapNav extends Component {

  shiftMapView = direction => event => {
    event.preventDefault();
    this.props.passMapViewDirection(direction);
    console.log(direction);
  }

  render() {
    return (
      <div className="mapNavWrapper container">
        <div className="row">
          <button
            id = "topleft"
            className="btn btn-primary mapNavButton"
            onClick={this.shiftMapView("topLeft")}
          >
            <span className="fas fa-chevron-left custom-fa-rotate-45"></span>
          </button>
          <button
            id="top"
            className="btn btn-primary mapNavButton"
            onClick={this.shiftMapView("top")}
          >
            <span className="fas fa-chevron-up"></span>
          </button>
          <button
            id="top-right"
            className="btn btn-primary mapNavButton"
            onClick={this.shiftMapView("topRight")}
          >
            <span className="fas fa-chevron-up custom-fa-rotate-45"></span>
          </button>
        </div>
        <div className="row">
          <button
            id="left"
            className="btn btn-primary mapNavButton"
            onClick={this.shiftMapView("left")}>
            <span className="fas fa-chevron-left"></span>
          </button>
          <button id="navigate" className="btn btn-primary mapNavButton">
            <span className="fas fa-crosshairs"></span>
          </button>
          <button
            id="right"
            className="btn btn-primary mapNavButton"
            onClick={this.shiftMapView("right")}
          >
            <span className="fas fa-chevron-right"></span>
          </button>
        </div>
        <div className="row">
          <button
            id="bottom-left"
            className="btn btn-primary mapNavButton" 
            onClick={this.shiftMapView("bottomLeft")}
          >
            <span className="fas fa-chevron-down custom-fa-rotate-45"></span>
          </button>
          <button
            id="bottom"
            className="btn btn-primary mapNavButton"
            onClick={this.shiftMapView("bottom")}
          >
            <span className="fas fa-chevron-down"></span>
          </button>
          <button
            id="bottom-right"
            className="btn btn-primary mapNavButton"
            onClick={this.shiftMapView("bottomRight")}
          >
            <span className="fas fa-chevron-right custom-fa-rotate-45"></span>
          </button>
        </div>        
      </div>
    );
  }
}

export default MapNav;
