import React, {Component} from "react"
import Matter from "matter-js";
import MatterAttractors from "matter-attractors";

class Shapes extends Component {
    componentWillUnmount() {
        // Todo remove event listeners
    }

    componentDidMount() {
        const Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            Composites = Matter.Composites,
            Bodies = Matter.Bodies,
            World = Matter.World;

        Matter.use(MatterAttractors);

        const engine = Engine.create({
            positionIterations: 8
        });

        const palette = {
            //brandWhite: '#FFFFFF',
            //brandGrey: '#A8A8A8',
            //brandYellow: '#4B0082',
            //brandGreen: '#80CE32',
            //brandRed: '#CE3232',
            //brandPink: '#D991BA',
            brandBlue: '#3FA7D6'
        }

        const shapes = {
            //rectangle1: { width: 100, height: 200 },
            //rectangle2: { width: 200, height: 200 },
            rectangle2: { width: 1000, height: 400 },
        }

        const paletteKeys = Object.keys(palette);
        const shapesKeys = Object.keys(shapes);

        this.docHeight = document.body.clientHeight;
        this.viewportHeight = window.innerHeight;
        this.docWidth = document.body.clientWidth;

        const render = Render.create({
          element: this.refs.scene,
          engine: engine,
          options: {
            width: this.docWidth,
            height: this.docHeight,
            background: 'transparent',
            wireframes: false
          }
        });

        engine.world.gravity.scale = 0.000005;
        engine.world.gravity.y = 0;

        this.attractor = Matter.Bodies.circle(-this.docWidth / 1, - this.viewportHeight / 1, this.viewportHeight * 0.75, {
            isStatic: true,
            render: { fillStyle: 'transparent', strokeStyle: '#FFFFFF55', lineWidth: 0 },
            chamfer: { radius: this.viewportHeight * 0.33 },
            plugin: {
              attractors: [
                (bodyA, bodyB) => {
                  return {
                    x: (bodyA.position.x - bodyB.position.x) * 0.000005,
                    y: (bodyA.position.y - bodyB.position.y) * 0.00001,
                  };
                }
              ]
            }
        });

        Matter.Body.scale(this.attractor, 0.00001, 0.00001);

        World.add(engine.world, this.attractor);

        this.stack = Composites.stack(-264, -264, 6, 4, 64, 64, (x, y, i, j) => {
            const options = {
                render: {
                    strokeStyle: palette[paletteKeys[(i + j) % paletteKeys.length]] + 'FF',
                    lineWidth: 10,
                    fillStyle: 'transparent'
                },
                chamfer: 32
            }

            const shape = shapes[shapesKeys[(i + j) % shapesKeys.length]]


            if (shape.sides == null) {
                return Bodies.rectangle(x, y, shape.width, shape.height, options);
            } else {
                return Bodies.polygon(x, y, shape.sides, shape.size, options);
            }
        });

        World.add(engine.world, this.stack);

        Runner.run(engine);

        Render.run(render);

        document.addEventListener('mousedown', (e) => {
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.dragBody = Matter.Query.point(this.stack.bodies, { x: this.startX, y: this.startY }).shift();
        });

        document.addEventListener('mousemove', (e) => {
            if (this.dragBody) {
                Matter.Body.setPosition(this.dragBody, { x: e.clientX, y: e.clientY });
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (this.dragBody) {
                const maxVelo = 10;
                const xVelo = Math.min(Math.max(e.clientX - this.startX, maxVelo), -1 * maxVelo);
                const yVelo = Math.min(Math.max(e.clientY - this.startY, maxVelo), -1 * maxVelo);
                Matter.Body.setVelocity(this.dragBody, { x: xVelo, y: yVelo });
                this.dragBody = null;
            }
        });
    }

    createWalls = (World, Bodies, engine) => {
        const wallThickness = 50;

        const floor = Bodies.rectangle(this.docWidth / 2, this.docHeight + wallThickness, this.docWidth, 2 * wallThickness, { isStatic: true });
        const ceiling = Bodies.rectangle(-wallThickness, this.docHeight + wallThickness, this.docWidth, 2 * wallThickness, { isStatic: true });

        const leftWall = Bodies.rectangle(-wallThickness, this.docHeight / 2, wallThickness * 2, this.docHeight, { isStatic: true });
        const rightWall = Bodies.rectangle(this.docWidth + wallThickness, this.docHeight / 2, wallThickness * 2, this.docHeight, { isStatic: true });

        World.add(engine.world, [ floor, ceiling, leftWall, rightWall ]);
    }

    render() {
        return <div ref="scene" className="shapes"/>
    }
}

export default Shapes
