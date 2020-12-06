import { Ivehicle } from './vehicle.model';
export interface IvehicleData {
  id: number;
  date: string;
  excavator: Array<Ivehicle>;
  trucks: Array<Ivehicle>;
}
