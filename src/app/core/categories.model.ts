export class Categories {
  private static DEFAULT: CategoryIcon = { iconUrl: 'assets/marker-icon.png', iconSize: [25, 41] };

  private static CATEGORIES: Map<string, CategoryIcon> = new Map([
    ['Rower', { iconUrl: 'assets/bicycle_icon.png', iconSize: [55, 55] }],
    ['Rolki', { iconUrl: 'assets/rollerblades_icon.png', iconSize: [43, 43] }],
    ['Spacer', { iconUrl: 'assets/walk_icon.png', iconSize: [35, 35] }],
    ['Wyjście z psem', { iconUrl: 'assets/dog_icon.png', iconSize: [51, 51] }],
    ['Siłownia', { iconUrl: 'assets/gym_icon.png', iconSize: [42, 42] }],
    ['Planszówki', { iconUrl: 'assets/cube_icon.png', iconSize: [42, 42] }],
    ['Spacer z dzieckiem w wózku', { iconUrl: 'assets/baby_carriage_icon.png', iconSize: [42, 42] }],
    ['Inne', this.DEFAULT]
  ]);

  static get(name: string): CategoryIcon {
    return this.CATEGORIES.get(name) ?? this.DEFAULT;
  }

  static keys(): string[] {
    return Array.from(this.CATEGORIES.keys());
  }
}

export interface CategoryIcon {
  iconUrl: string;
  iconSize: [number, number];
}
