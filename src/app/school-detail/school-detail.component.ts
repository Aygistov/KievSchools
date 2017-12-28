import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { School }         from '../school';
import { SchoolService }  from '../school.service';

@Component({
  selector: 'app-school-detail',
  templateUrl: './school-detail.component.html',
  styleUrls: [ './school-detail.component.css' ]
})
export class SchoolDetailComponent implements OnInit {
  @Input() school: School;

  constructor(
    private route: ActivatedRoute,
    private schoolService: SchoolService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.getSchool();
  }

  getSchool(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    this.schoolService.getSchool(id)
      .subscribe(school => this.school = school);
  }

  goBack(): void {
    this.location.back();
  }

 save(): void {
    this.schoolService.updateSchool(this.school)
      .subscribe(() => this.goBack());
  }
}
