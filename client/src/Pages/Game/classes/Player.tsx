class Player {
  public id: number;
  private startingPosition: Array<number>;
  private position: Array<number>;
  private speed: number;
  private score: number;
  private direction: string;
  private canHit: boolean;
  private relativePosition: number;

  constructor(position: Array<number>, id: number) {
    this.id = id;
    this.startingPosition = [...position];
    this.position = [...position];
    this.speed = 100;
    this.score = 0;
    this.direction = "n";
    this.canHit = true;
    this.relativePosition = 1;
  }

  resetPosition(): void {
    this.position = [...this.startingPosition];
  }

  getPosition(): Array<number> {
    return this.position;
  }

  getX(): number {
    return this.position[0];
  }

  getY(): number {
    return this.position[1];
  }

  getSpeed(): number {
    return this.speed;
  }

  getScore(): number {
    return this.score;
  }

  getDirection(): string {
    return this.direction;
  }

  getCanHit(): boolean {
    return this.canHit;
  }

  getRelativePosition(): number {
    return this.relativePosition;
  }

  setPosition(position: Array<number>): void {
    this.position = position;
  }

  setX(x: number): void {
    this.position[0] = x;
  }

  setY(y: number): void {
    this.position[1] = y;
  }

  setScore(score: number): void {
    this.score = score;
  }

  setDirection(direction: string): void {
    this.direction = direction;
  }

  setCanHit(canHit: boolean): void {
    this.canHit = canHit;
  }

  setRelativePosition(relativePosition: number): void {
    this.relativePosition = relativePosition;
  }
}

export default Player;
