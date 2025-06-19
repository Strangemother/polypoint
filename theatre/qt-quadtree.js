
	class QuadTree {
		constructor(boundary, n) {
			this.boundary = boundary;
			this.capacity = n;
			this.points = [];
			this.divided = false;
		}

		clear() {
			this.points = []
			this.divided = false;
		}

		subdivide() {
			if(this.divided) {
				return;
			}

			let hw = this.boundary.w * .5
			let hh = this.boundary.h * .5
			let bx = this.boundary.x
			let by = this.boundary.y
			// nw
			let nw = new Rectangle(
				bx - hw,
				by - hh,
				hw,
				hh
			);
			this.northwest = new QuadTree(nw, this.capacity);

			// ne
			let ne = new Rectangle(
				bx + hw,
				by - hh,
				hw,
				hh
			);
			this.northeast = new QuadTree(ne, this.capacity);

			// sw
			let sw = new Rectangle(
				bx - hw,
				by + hh,
				hw,
				hh
			);
			this.southwest = new QuadTree(sw, this.capacity);

			// se
			let se = new Rectangle(
				bx + hw,
				by + hh,
				hw,
				hh
			);
			this.southeast = new QuadTree(se, this.capacity);

			// prevent further dividing
			this.divided = true;
		}

		insert(point) {
			if(!this.boundary.contains(point)) {
				return;
			}

			if(this.points.length < this.capacity) {
				this.points.push(point);
				return
			}

			this.subdivide();

			this.northwest.insert(point);
			this.northeast.insert(point);
			this.southwest.insert(point);
			this.southeast.insert(point);

		}

		query(range, found) {
			if(!found) {
				found = new PointList;
			}

			if(!this.boundary.insersects(range)) {
				return found;
			}

			for(let p of this.points) {
				if(range.contains(p)) {
					found.push(p);
				}
			}

			if(this.divided) {
				this.northwest.query(range, found);
				this.northeast.query(range, found);
				this.southwest.query(range, found);
				this.southeast.query(range, found);
			}

			return found;
		}

		show(ctx) {
			// stroke(255);
			// strokeWeight(1);
			// noFill();
			// rectMode(CENTER);
			let b = this.boundary
		    let hw = b.w
		    let hh = b.h
			ctx.rect(b.x - hw,
					b.y - hh,
					b.w * 2,
					b.h * 2
				);

			if(this.divided) {
				this.northwest.show(ctx);
				this.northeast.show(ctx);
				this.southwest.show(ctx);
				this.southeast.show(ctx);
			}

			// for(let p of this.points) {
			// 	strokeWeight(3);
			// 	point(p.x, p.y);
			// }
		}
	}
