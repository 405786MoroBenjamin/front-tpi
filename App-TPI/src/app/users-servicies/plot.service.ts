import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PlotTypeModel } from '../users-models/PlotType';
import { PlotStateModel } from '../users-models/PlotState';
import { PlotModel } from '../users-models/Plot';
import { GetPlotModel } from '../users-models/GetPlot';
import { PutPlot } from '../users-models/PutPlot';

@Injectable({
  providedIn: 'root'
})
export class PlotService {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly url = 'http://localhost:8081';

  constructor() { }

  getAllTypes(): Observable<PlotTypeModel[]>{
    return this.http.get<PlotTypeModel[]>(this.url + '/plots/types');
  }

  getAllPlots(): Observable<GetPlotModel[]>{
    return this.http.get<GetPlotModel[]>(this.url + '/plots');
  }

  gePlotById(plotId: number): Observable<GetPlotModel>{
    return this.http.get<GetPlotModel>(this.url + '/plots/' + plotId);
  }
  
  getAllStates(): Observable<PlotStateModel[]>{
    return this.http.get<PlotStateModel[]>(this.url + '/plots/states');
  }

  postPlot(plot: PlotModel): Observable<PlotModel>{
    return this.http.post<PlotModel>(this.url + "/plots", plot);
  }

  putPlot(id: number,  plot: PutPlot): Observable<PutPlot>{
    return this.http.put<PutPlot>(`${this.url}/plots?plotId=${id}`, plot);
  }
}