import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500 })
  title: string;

  static make(id: string) {
    return new Submission(id, '');
  }

  constructor(id: string, title: string) {
    this.id = id;
    this.title = title;
  }

  changeTitle(title: string) {
    this.title = title;
  }
}