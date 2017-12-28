import { Component, OnInit } from '@angular/core';
import { School } from '../school';
import { SchoolService } from '../school.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.css' ]
})
export class DashboardComponent implements OnInit {
  schools: School[] = [];

  constructor(private schoolService: SchoolService) { }

  ngOnInit() {
    this.getSchools();
  }

  getSchools(): void {
    this.schoolService.getSchools()
      .subscribe(schools => this.schools = schools.slice(1, 5));
  }
}
