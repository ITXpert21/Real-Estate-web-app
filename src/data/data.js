export const residentialOptions = [
    {value: 'Casa', label: 'Casa'},
    {value: 'Departamento', label: 'Departamento'},
    {value: 'Duplex', label: 'Duplex'},
    {value: 'PH', label: 'PH'},
    {value: 'Casa Quinta', label: 'Casa Quinta'},
    {value: 'Cabaña', label: 'Cabaña'},
    {value: 'Piso', label: 'Piso'}
];

export const comercialOptions = [
    {value: 'Local', label: 'Local'},
    {value: 'Campo', label: 'Campo'},
    {value: 'Cochera', label: 'Cochera'},
    {value: 'Terreno', label: 'Terreno'},
    {value: 'Oficina', label: 'Oficina'},
    {value: 'Galpón', label: 'Galpón'},
    {value: 'Edificio', label: 'Edificio'},
    {value: 'Fondo de Comercio', label: 'Fondo de Comercio'},
    {value: 'Depósito', label: 'Depósito'},
    {value: 'Industriales', label: 'Industriales'},
    {value: 'Countries y Barrios', label: 'Countries y Barrios'},
    {value: 'Fracciones', label: 'Fracciones'},
    {value: 'Otros', label: 'Otros'}
];

export const groupedOptions = [
    {
        label: 'Residencial',
        options: residentialOptions
    },
    {
        label: 'Comercial',
        options: comercialOptions
    },
];

export const newestOptions = [
  { label: 'Todas', value: '-1' },
  { label: 'Hoy', value: '1' },
  { label: 'Esta Semana', value: '7' },
  { label: 'Este Mes', value: '30' },
  { label: '3 Meses', value: '90' },
]
