const canvas = document.querySelector("canvas");
        const ctx = canvas.getContext('2d');

        // for intro motion
        let mouseMoved = false;

        const pointer = {
            x: .5 * window.innerWidth,
            y: .5 * window.innerHeight,
        }
        const params = {
            pointsNumber: 40,
            widthFactor: .3,
            mouseThreshold: .6,
            spring: .4,
            friction: .5
        };

        const trail = new Array(params.pointsNumber);
        for (let i = 0; i < params.pointsNumber; i++) {
            trail[i] = {
                x: pointer.x,
                y: pointer.y,
                dx: 0,
                dy: 0,
            }
        }

        window.addEventListener("click", e => {
            updateMousePosition(e.pageX, e.pageY);
        });
        window.addEventListener("mousemove", e => {
            mouseMoved = true;
            updateMousePosition(e.pageX, e.pageY);
        });
        window.addEventListener("touchmove", e => {
            mouseMoved = true;
            updateMousePosition(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
        });

        function updateMousePosition(eX, eY) {
            pointer.x = eX;
            pointer.y = eY;
        }

        setupCanvas();
        update(0);
        window.addEventListener("resize", setupCanvas);

        function update(t) {
            // for intro motion
            if (!mouseMoved) {
                pointer.x = (.5 + .3 * Math.cos(.002 * t) * (Math.sin(.005 * t))) * window.innerWidth;
                pointer.y = (.5 + .2 * (Math.cos(.005 * t)) + .1 * Math.cos(.01 * t)) * window.innerHeight;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Ajusta a posição do cursor com base no scroll
            const scrollY = window.scrollY || window.pageYOffset;
            const adjustedY = pointer.y - scrollY;

            // Desenha o cursor apenas se estiver dentro da área visível
            if (adjustedY >= 0 && adjustedY <= window.innerHeight) {
                trail.forEach((p, pIdx) => {
                    const prev = pIdx === 0 ? pointer : trail[pIdx - 1];
                    const spring = pIdx === 0 ? .4 * params.spring : params.spring;
                    p.dx += (prev.x - p.x) * spring;
                    p.dy += (prev.y - p.y) * spring;
                    p.dx *= params.friction;
                    p.dy *= params.friction;
                    p.x += p.dx;
                    p.y += p.dy;
                });

                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(trail[0].x, trail[0].y - scrollY);

                for (let i = 1; i < trail.length - 1; i++) {
                    const xc = .5 * (trail[i].x + trail[i + 1].x);
                    const yc = .5 * (trail[i].y + trail[i + 1].y) - scrollY;
                    ctx.quadraticCurveTo(trail[i].x, trail[i].y - scrollY, xc, yc);
                    ctx.lineWidth = params.widthFactor * (params.pointsNumber - i);
                    ctx.strokeStyle = "#333341"; // Cor do rastro
                    ctx.stroke();
                }
                ctx.lineTo(trail[trail.length - 1].x, trail[trail.length - 1].y - scrollY);
                ctx.stroke();
            }

            window.requestAnimationFrame(update);
        }

        function setupCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }