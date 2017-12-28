import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';

import { School } from './school';
import { MessageService } from './message.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class SchoolService {

  private schoolsUrl = 'api/schools';  // URL to web api

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  /** GET schools from the server */
  getSchools (): Observable<School[]> {
    return this.http.get<School[]>(this.schoolsUrl)
      .pipe(
        tap(schools => this.log(`fetched schools`)),
        catchError(this.handleError('getSchools', []))
      );
  }

  /** GET school by id. Return `undefined` when id not found */
  getSchoolNo404<Data>(id: number): Observable<School> {
    const url = `${this.schoolsUrl}/?id=${id}`;
    return this.http.get<School[]>(url)
      .pipe(
        map(schools => schools[0]), // returns a {0|1} element array
        tap(h => {
          const outcome = h ? `fetched` : `did not find`;
          this.log(`${outcome} school id=${id}`);
        }),
        catchError(this.handleError<School>(`getSchool id=${id}`))
      );
  }

  /** GET school by id. Will 404 if id not found */
  getSchool(id: number): Observable<School> {
    const url = `${this.schoolsUrl}/${id}`;
    return this.http.get<School>(url).pipe(
      tap(_ => this.log(`fetched school id=${id}`)),
      catchError(this.handleError<School>(`getSchool id=${id}`))
    );
  }

  /* GET schools whose name contains search term */
  searchSchools(term: string): Observable<School[]> {
    if (!term.trim()) {
      // if not search term, return empty school array.
      return of([]);
    }
    return this.http.get<School[]>(`api/schools/?name=${term}`).pipe(
      tap(_ => this.log(`found schools matching "${term}"`)),
      catchError(this.handleError<School[]>('searchSchools', []))
    );
  }

  //////// Save methods //////////

  /** POST: add a new school to the server */
  addSchool (school: School): Observable<School> {
    return this.http.post<School>(this.schoolsUrl, school, httpOptions).pipe(
      tap((school: School) => this.log(`added school w/ id=${school.id}`)),
      catchError(this.handleError<School>('addSchool'))
    );
  }

  /** DELETE: delete the school from the server */
  deleteSchool (school: School | number): Observable<School> {
    const id = typeof school === 'number' ? school : school.id;
    const url = `${this.schoolsUrl}/${id}`;

    return this.http.delete<School>(url, httpOptions).pipe(
      tap(_ => this.log(`deleted school id=${id}`)),
      catchError(this.handleError<School>('deleteSchool'))
    );
  }

  /** PUT: update the school on the server */
  updateSchool (school: School): Observable<any> {
    return this.http.put(this.schoolsUrl, school, httpOptions).pipe(
      tap(_ => this.log(`updated school id=${school.id}`)),
      catchError(this.handleError<any>('updateSchool'))
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a SchoolService message with the MessageService */
  private log(message: string) {
    this.messageService.add('SchoolService: ' + message);
  }
}
