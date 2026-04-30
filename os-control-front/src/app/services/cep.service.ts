import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {CepApi} from '../models/cliente.model';


@Injectable({
  providedIn: 'root',
})
export class CepService {
  constructor(private http: HttpClient) {}

 buscarPorCep(cep: string): Observable<CepApi> {
  return this.http.get<CepApi>(`https://viacep.com.br/ws/${cep}/json/`);
}

}
