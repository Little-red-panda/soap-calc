export interface Oil {
  name: string;
  sap: number;
}

export interface SelectedOil extends Oil {
  weight: number;
}

export const oils: Oil[] = [
  { name: 'Кокосовое масло', sap: 0.183 },
  { name: 'Пальмовое масло', sap: 0.142 },
  { name: 'Оливковое масло', sap: 0.134 },
  { name: 'Подсолнечное масло', sap: 0.134 },
  { name: 'Рапсовое масло', sap: 0.124 },
  { name: 'Масло ши (карите)', sap: 0.128 },
  { name: 'Масло жожоба', sap: 0.069 },
  { name: 'Касторовое масло', sap: 0.128 },
  { name: 'Миндальное масло', sap: 0.136 },
  { name: 'Масло авокадо', sap: 0.133 },
  { name: 'Сквалан', sap: 0 },
  { name: 'Оливковое масло (Extra Virgin)', sap: 0.134 },
  { name: 'Аргановое масло', sap: 0.136 },
  { name: 'Масло виноградных косточек', sap: 0.126 },
  { name: 'Гранатовое масло', sap: 0.136 },
  { name: 'Масло макадамии', sap: 0.139 },
  { name: 'Масло манго', sap: 0.137 }
];

export const superfatOils: Oil[] = [
  { name: 'Масло ши (карите)', sap: 0.128 },
  { name: 'Масло жожоба', sap: 0.069 },
  { name: 'Касторовое масло', sap: 0.128 },
  { name: 'Миндальное масло', sap: 0.136 },
  { name: 'Масло авокадо', sap: 0.133 },
  { name: 'Сквалан', sap: 0 },
  { name: 'Оливковое масло (Extra Virgin)', sap: 0.134 },
  { name: 'Аргановое масло', sap: 0.136 },
  { name: 'Масло виноградных косточек', sap: 0.126 },
  { name: 'Гранатовое масло', sap: 0.136 },
  { name: 'Масло макадамии', sap: 0.139 },
  { name: 'Масло манго', sap: 0.137 }
]; 