import { Component, OnInit } from '@angular/core';
import * as Leaflet from 'leaflet';

import * as data from '../../assets/data.json';
import { cloneDeep } from 'lodash';
import { IconstructionData } from './model/constructionData.model';
import { IvehicleData } from './model/vehicleData.model';
import { Ivehicle } from './model/vehicle.model';

@Component({
  selector: 'app-gis',
  templateUrl: './gis.component.html',
  styleUrls: ['./gis.component.scss'],
})
export class GisComponent implements OnInit {
  private lat: number;
  private lng: number;
  private _radius = 1000;
  public _latLng: any;
  private circle: any;
  private marker: any;
  private map: any;
  private excavatorIcon;
  public excavators: Ivehicle[] = [];
  public trucks: Ivehicle[] = [];
  private truckIcon;
  public tabSelect = true;
  private customMarker = [];
  public vehicleDetails: IvehicleData = null;
  public siteDetails: IconstructionData;
  public timeRange = 12;
  private count = 0;
  public todayDate = new Date();
  public selectedData = new Date();
  public siteNames: any[] = [];
  constructionDetails: IconstructionData[] = (data as any).default;

  constructor() {}

  ngOnInit() {
    // loading Custom Icons for maps

    this.excavatorIcon = Leaflet.icon({
      iconUrl: './../../assets/Escavation.png',
      iconSize: [38, 40],
    });
    this.truckIcon = Leaflet.icon({
      iconUrl: './../../assets/truck.png',
      iconSize: [40, 30],
    });

    this.constructionDetails.filter((site) => {
      if (site.constructionArea !== '') {
        this.siteNames.push(site.constructionArea);
      }
    });
  }

  onSelectSiteName(event) {
    const selectedValue = event.target.value;
    // getting the co-ordinates as per selected Site Name;
    const constructionDetail: IconstructionData[] = cloneDeep(
      this.constructionDetails
    );
    const siteDetail: IconstructionData = constructionDetail.find((site) => {
      if (site.constructionArea === selectedValue) {
        this.lat = site.latitude;
        this.lng = site.longitude;
        this.count += 1;
        return site;
      }
    });
    this.siteDetails = siteDetail;
    if (siteDetail) {
      this.dateFilter();
    }

    this.loadingMap();
  }

  dateFilter() {
    const siteDetail = cloneDeep(this.siteDetails);
    const vehicleDetail: IvehicleData = siteDetail.vehicleData.find((data) => {
      const hourtime = new Date(data.date).getHours();
      const date = new Date(data.date).toLocaleDateString();
      if (
        date === this.selectedData.toLocaleDateString() &&
        hourtime === this.timeRange
      ) {
        return data;
      }
    });
    this.vehicleDetails = vehicleDetail;
    if (this.vehicleDetails) {
      this.excavators = this.vehicleDetails.excavator;
      this.trucks = this.vehicleDetails.trucks;

      this.excavators.forEach((data) => {
        data.time = new Date(data.date).toLocaleDateString();
        data.date = new Date(data.date).toLocaleTimeString();
        this.customMarker.push(
          Leaflet.marker([data.latitude, data.longitude], {
            icon: this.excavatorIcon,
          }).addTo(this.map)
        );
      });

      this.trucks.forEach((data) => {
        data.time = new Date(data.date).toLocaleDateString();
        data.date = new Date(data.date).toLocaleTimeString();
        this.customMarker.push(
          Leaflet.marker([data.latitude, data.longitude], {
            icon: this.truckIcon,
          }).addTo(this.map)
        );
      });
    } else {
      if (this.customMarker.length > 0) {
        this.customMarker.forEach((e) => this.map.removeLayer(e));
      }
    }
  }

  // loading initial map

  loadingMap() {
    this._latLng = Leaflet.latLng(this.lat, this.lng);
    if (this.count === 1) {
      setTimeout(this.loadMap.bind(this), 100);
    } else {
      this.map.removeLayer(this.marker);
      this.map.removeLayer(this.circle);
      this.marker = Leaflet.marker(this.latLng, { draggable: false }).addTo(
        this.map
      );
      this.circle = Leaflet.circle(this.latLng, this.radius).addTo(this.map);

      // Loading Map
      this.map.panTo(new Leaflet.LatLng(this.lat, this.lng));
    }
  }

  onHandleDateRedution() {
    const date = new Date(this.selectedData);
    date.setDate(date.getDate() - 1);
    this.selectedData = date;
    this.dateFilter();
  }

  onHandleDateIncreament() {
    const date = new Date(this.selectedData);
    date.setDate(date.getDate() + 1);
    this.selectedData = date;
    this.dateFilter();
  }

  onHandleChangingTimeRange() {
    this.vehicleDetails = null;
    this.dateFilter();
  }

  onHandleMapviewClick() {
    this.tabSelect = true;
  }

  onHandleDocumentviewClick() {
    this.tabSelect = false;
  }

  get radius() {
    return this._radius;
  }

  set radius(value) {
    this._radius = value;
    this.circle.setRadius(value);
  }

  set latLng(value) {
    this._latLng = value;
    this.circle.setLatLng(value);
    this.marker.setLatLng(value);
  }

  get latLng() {
    return this._latLng;
  }

  loadMap() {
    this.map = Leaflet.map('map').setView(this.latLng, 15);

    Leaflet.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    ).addTo(this.map);

    this.marker = Leaflet.marker(this.latLng, { draggable: false }).addTo(
      this.map
    );

    this.circle = Leaflet.circle(this.latLng, this.radius).addTo(this.map);
  }
}
