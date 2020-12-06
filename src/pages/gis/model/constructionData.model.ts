import { IvehicleData } from './vehicleData.model';
export interface IconstructionData {
  id: number;
  constructionArea: string;
  latitude: number;
  longitude: number;
  radius: number;
  siteSupervisor: string;
  mobile: number;
  vehicleData: Array<IvehicleData>;
}
