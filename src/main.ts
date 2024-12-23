import CanvasParameters from "canvas-parameters";

interface ICircle {
	color: string;
	radius: number;
	xPos: number;
	yPos: number;
	velocityX: number;
	velocityY: number;
}

class CircleIntersection {
	cnv?: HTMLCanvasElement;
	ctx?: CanvasRenderingContext2D | null;
	w?: number;
	h?: number;
	circles?: ICircle[];
	circleStrokeColor: string;
	intersectionFillColor: string;
	intersectionStrokeColor: string;
	intersectionDotRadius: number;
	circleSpeed: number;
	circlesNum: number;

	constructor({
		circlesNum,
		circleSpeed,
		intersectionFillColor,
	}: {
		circlesNum: number;
		circleSpeed: number;
		intersectionFillColor: string;
	}) {
		this.circleStrokeColor = "white";
		this.intersectionFillColor = intersectionFillColor;
		this.intersectionStrokeColor = "#ffffff";
		this.intersectionDotRadius = 1;
		this.circleSpeed = circleSpeed;
		this.circlesNum = circlesNum;

		this.createCanvas();
		this.setCanvasSize();
		this.createCircles();
		this.updateAnimation();

		window.addEventListener("resize", () => {
			this.setCanvasSize();
			this.createCircles();
		});
	}

	createCanvas() {
		this.cnv = document.createElement("canvas");

		this.cnv.style.background = this.getRandomColor();
		this.ctx = this.cnv.getContext("2d");
		document.body.appendChild(this.cnv);
	}

	getRandomColor(alpha = 1) {
		return `hsla(${Math.random() * 360}, 70%, 50%, ${alpha})`;
	}

	setCanvasSize() {
		if (!this.cnv) throw new Error("no cnv");

		this.w = this.cnv.width = innerWidth;
		this.h = this.cnv.height = innerHeight;
	}

	createCircles() {
		if (!this.w || !this.h) throw new Error("no h or w");
		const smallerSide = Math.min(this.w, this.h);
		const maxRadius = smallerSide / 3;
		const minRadius = maxRadius / 2;
		this.intersectionDotRadius = minRadius / 20;

		this.circles = [];
		for (let i = 0; i < this.circlesNum; i++) {
			const randomAngle = Math.random() * Math.PI * 2;

			const newCircle: ICircle = {
				color: this.getRandomColor(0.5),
				radius: this.getRandomFromRange(minRadius, maxRadius),
				xPos: this.getRandomFromRange(maxRadius, this.w - maxRadius),
				yPos: this.getRandomFromRange(maxRadius, this.h - maxRadius),
				velocityX: Math.cos(randomAngle) * this.circleSpeed,
				velocityY: Math.sin(randomAngle) * this.circleSpeed,
			};

			this.circles.push(newCircle);
		}
	}

	getRandomFromRange(min: number, max: number) {
		return Math.random() * max - min + min;
	}

	updateCircles() {
		if (!this.circles) throw new Error("no circles");
		if (!this.ctx) throw new Error("no ctx");

		this.ctx.globalCompositeOperation = "lighten";

		for (let i = 0; i < this.circles.length; i++) {
			const circle = this.circles[i];

			this.checkBounce(circle);

			circle.xPos += circle.velocityX;
			circle.yPos += circle.velocityY;

			this.drawCircle(
				circle.xPos,
				circle.yPos,
				circle.radius,
				circle.color,
				this.circleStrokeColor,
			);
		}

		this.ctx.globalCompositeOperation = "source-over";
	}

	drawCircle(
		x: number,
		y: number,
		radius: number,
		fillColor: string,
		strokeColor: string,
	) {
		if (!this.ctx) throw new Error("no ctx");

		this.ctx.fillStyle = fillColor;
		this.ctx.strokeStyle = strokeColor;
		this.ctx.beginPath();
		this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
		this.ctx.fill();
		this.ctx.stroke();
	}

	getIntersection() {
		if (!this.circles) throw new Error("no circles");

		for (let i = 0; i < this.circles.length; ++i) {
			const circleA = this.circles[i];
			for (let j = i + 1; j < this.circles.length; ++j) {
				const circleB = this.circles[j];

				const dx = circleB.xPos - circleA.xPos;
				const dy = circleB.yPos - circleA.yPos;
				const distance = Math.hypot(dx, dy);

				if (distance <= circleA.radius + circleB.radius) {
					this.drawIntersection(
						circleA.radius,
						circleB.radius,
						distance,
						dx,
						dy,
						circleA,
					);
				}
			}
		}
	}

	checkBounce(circle: ICircle) {
		if (!this.w || !this.h) throw new Error("no h or w");

		if (
			(circle.xPos + circle.radius > this.w && circle.velocityX > 0) ||
			(circle.xPos < circle.radius && circle.velocityX < 0)
		) {
			circle.velocityX = -circle.velocityX;
		}
		if (
			(circle.yPos + circle.radius > this.h && circle.velocityY > 0) ||
			(circle.yPos < circle.radius && circle.velocityY < 0)
		) {
			circle.velocityY = -circle.velocityY;
		}
	}

	drawIntersection(
		sideA: number,
		sideB: number,
		sideC: number,
		dx: number,
		dy: number,
		circle: ICircle,
	) {
		const aSquare = sideA ** 2;
		const bSquare = sideB ** 2;
		const cSquare = sideC ** 2;

		const cosineA = (aSquare - bSquare + cSquare) / (sideA * sideC * 2);
		const angleOfRotation = Math.acos(cosineA);
		const angleCorrection = Math.atan2(dy, dx);

		const pointOneX =
			circle.xPos + Math.cos(angleCorrection - angleOfRotation) * sideA;
		const pointOenY =
			circle.yPos + Math.sin(angleCorrection - angleOfRotation) * sideA;

		const pointTwoX =
			circle.xPos + Math.cos(angleCorrection + angleOfRotation) * sideA;
		const pointTwoY =
			circle.yPos + Math.sin(angleCorrection + angleOfRotation) * sideA;

		this.drawCircle(
			pointOneX,
			pointOenY,
			this.intersectionDotRadius,
			this.intersectionFillColor,
			this.intersectionStrokeColor,
		);
		this.drawCircle(
			pointTwoX,
			pointTwoY,
			this.intersectionDotRadius,
			this.intersectionFillColor,
			this.intersectionStrokeColor,
		);
	}

	clearCanvas() {
		if (!this.ctx) throw new Error("no ctx");
		if (!this.w || !this.h) throw new Error("no h or w");
		this.ctx.clearRect(0, 0, this.w, this.h);
	}

	updateAnimation() {
		this.clearCanvas();
		this.updateCircles();
		this.getIntersection();
		return requestAnimationFrame(() => this.updateAnimation());
	}

	setCirclesNum(circlesNum: number) {
		this.circlesNum = circlesNum;
	}

	setCircleSpeed(circleSpeed: number) {
		this.circleSpeed = circleSpeed;
	}

	setIntersectionFillColor(intersectionFillColor: string) {
		this.intersectionFillColor = intersectionFillColor;
	}
}

const defaultParameters = {
	circlesNum: 5,
	circleSpeed: 0.5,
	intersectionFillColor: "#ffffff",
};

const circleIntersection = new CircleIntersection(defaultParameters);

new CanvasParameters(
	[
		{
			type: "number",
			placeholder: "Количество шаров",
			name: "circlesNum",
			value: circleIntersection.circlesNum.toString(),
			onChange: (value) => {
				circleIntersection.setCirclesNum(value);
			},
		},
		{
			type: "number",
			placeholder: "Скорость перемещения",
			name: "circleSpeed",
			value: circleIntersection.circleSpeed.toString(),
			onChange: (value) => {
				circleIntersection.setCircleSpeed(value);
			},
		},
		{
			type: "color",
			placeholder: "Цвет точек перемещения",
			name: "intersectionFillColor",
			value: circleIntersection.intersectionFillColor,
			onChange: (value) => {
				circleIntersection.setIntersectionFillColor(value);
			},
		},
	],
	{
		onUpdateCanvas: () => {
			circleIntersection.createCircles();
			const id = circleIntersection.updateAnimation();
			cancelAnimationFrame(id);
		},
	},
);
