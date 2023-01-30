class Ball {
  private startingPosition: Array<number>;
  private position: Array<number>;
  private ballSize: number;
  private speed: number;
  private dx: number;
  private dy: number;
  private relativePosition: Array<number>;

  constructor(startingPosition: Array<number>, ballSize: number) {
    this.ballSize = ballSize;
    this.startingPosition = [...startingPosition];
    this.startingPosition[0] = this.startingPosition[0] - this.ballSize / 2;
    this.startingPosition[1] = this.startingPosition[1] - this.ballSize / 2;
    this.position = [...this.startingPosition];
    this.speed = 100;
    this.dx = this.initializeDirection()[0];
    this.dy = this.initializeDirection()[1];
    this.relativePosition = [1, 1];
  }

  private getRandomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  initializeDirection(): Array<number> {
    const arr: Array<number> = [];

    arr[0] = this.getRandomRange(0.4, 0.8);
    arr[1] = 1 - arr[0];
    Math.random() < 0.5 ? (arr[0] *= 1) : (arr[0] *= -1);
    Math.random() < 0.5 ? (arr[1] *= 1) : (arr[1] *= -1);
    return arr;
  }

  resetPosition(): void {
    this.position = [...this.startingPosition];
  }

  getStartingPosition(): Array<number> {
    return this.startingPosition;
  }

  setStartingPosition(startingPosition: Array<number>): void {
    this.startingPosition = [...startingPosition];
  }

  getPosition(): Array<number> {
    return this.position;
  }

  setPosition(position: Array<number>): void {
    this.position = [...position];
  }

  getX(): number {
    return this.position[0];
  }

  getY(): number {
    return this.position[1];
  }

  setX(x: number): void {
    this.position[0] = x;
  }

  setY(y: number): void {
    this.position[1] = y;
  }

  getSpeed(): number {
    return this.speed;
  }

  getTopBorder(): number {
    return this.getY();
  }

  getBottomBorder(): number {
    return this.getY() + this.ballSize;
  }

  getLeftBorder(): number {
    return this.getX();
  }

  getRightBorder(): number {
    return this.getX() + this.ballSize;
  }

  getDirectionX(): number {
    return this.dx;
  }

  getDirectionY(): number {
    return this.dy;
  }

  setDirectionX(dx: number): void {
    this.dx = dx;
  }

  setDirectionY(dy: number): void {
    this.dy = dy;
  }

  getRelativePosition(): Array<number> {
    return this.relativePosition;
  }

  setRelativePosition(relativePosition: Array<number>): void {
    this.relativePosition = [...relativePosition];
  }
}

export default Ball;
