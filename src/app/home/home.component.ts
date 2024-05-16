import {Component, NgZone, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {AppService} from "../app.service";
import {ElectronService} from "../core/services";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {


  constructor() {

  }

  ngOnInit(): void {

  }

}
