import { Component, OnInit } from '@angular/core';

import { School } from '../school';
import { SchoolService } from '../school.service';

@Component({
  selector: 'app-schools',
  templateUrl: './schools.component.html',
  styleUrls: ['./schools.component.css']
})
export class SchoolsComponent implements OnInit {
  schools: School[];

  constructor(private schoolService: SchoolService) { }

  ngOnInit() {
    this.getSchools();
  }

  getSchools(): void {
    this.schoolService.getSchools()
    .subscribe(schools => this.schools = schools);
  }

  add(name: string): void {
    name = name.trim();
    if (!name) { return; }
    this.schoolService.addSchool({ name } as School)
      .subscribe(school => {
        this.schools.push(school);
      });
  }

  delete(school: School): void {
    this.schools = this.schools.filter(h => h !== school);
    this.schoolService.deleteSchool(school).subscribe();
  }

}
