	
	let qtree;
	
	function setup() {
		createCanvas(600, 600);
		
		let boundary = new Rectangle(300, 300, 300, 300);
		qtree = new QuadTree(boundary, 4);
		
		for(let i = 0; i < 500; i++) {
			//let p = new Point(random), random(height));
			let x = randomGaussian(width/2, width/8);
			let y = randomGaussian(height/2, height/8);
			let p = new Point(x, y);
			
			qtree.insert(p);
		}
	}
	
	function draw() {
		if(mouseIsPressed) {
			let p = new Point(mouseX, mouseY);
			qtree.insert(p);
		}
		
		background(0);
		
		qtree.show();
		
		stroke(0, 255, 0);
		strokeWeight(1);
		rectMode(CENTER);
		
		let range = new Rectangle(mouseX, mouseY, 75, 64);
		
		let points = qtree.query(range);
		
		stroke(200, 0, 0);
		strokeWeight(1);
		text("Found: "+ points.length, (range.x + 3 - range.w), (range.y - 10 - range.h));
		
		stroke(0, 255, 0);
		strokeWeight(1);
		fill(color(0, 255, 0, 30));
		rect(range.x, range.y, (range.w * 2), (range.h * 2));
		
		stroke(0, 255, 0);
		strokeWeight(3);
		
		for(let p of points) {
			point(p.x, p.y);
		}
	}
	