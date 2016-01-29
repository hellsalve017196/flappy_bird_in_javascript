var
    canvas,context,width,height,

    frame = 0,
    score = 0,
    best = 0,
    fgpos = 0,

    currentState,
    states = {
        Splash : 0,
        Game : 1,
        Score : 2
    },
    okbtn,
    bird = {
      x : 60,
      y : 0,
      radius : 12,
      frame : 0,
      velocity : 0,
      animation : [0,1,2,1],
      rotation : 12,
      gravity : 0.25,
      _jump : 4.6,

      jump : function() {
          this.velocity =- this._jump;
      },

      update :  function() {

          var n = currentState === states.Splash ? 10 : 5;

          this.frame += frame % n === 0 ? 1 : 0;
          this.frame %= this.animation.length;

          // up and down animation 5 : 10 is a ratio,280 is bird height
          if(currentState === states.Splash) {
              this.y = height - 280 + 5 * Math.cos(frame / 10);
              this.rotation = 0;
          }
          else {

              // the physics

              this.velocity += this.gravity;
              this.y += this.velocity;

              // change to the score state when bird touches the ground
              if (this.y >= height - s_fg.height-10) {
                  this.y = height - s_fg.height-10;
                  if (currentState === states.Game) {
                      currentState = states.Score;
                  }
                  // sets velocity to jump speed for correct rotation
                  this.velocity = this._jump;
              }

              // when bird lack upward momentum increment the rotation
              // angle
              if (this.velocity >= this._jump) {
                  this.frame = 1;
                  this.rotation = Math.min(Math.PI/2, this.rotation + 0.3);

              } else {
                  this.rotation = -0.3;
              }
          }


      },
      draw : function(context) {
          context.save();
          context.translate(this.x,this.y);
          context.rotate(this.rotation);

          var n = this.animation[this.frame];
          s_bird[n].draw(context,-(s_bird[n].width/2),-(s_bird[n].height/2));

          context.restore();
      }
    },
    pipes = {

      _pipes : [],

      reset : function() {
        this._pipes = [];
      },

      update : function() {
            if(frame % 100 === 0) {
                var _y = height - (s_pipeSouth.height + s_fg.height+120+200 * Math.random())

                this._pipes.push(
                    {
                        x : 500,
                        y: _y,
                        width : s_pipeSouth.width,
                        height : s_pipeSouth.height
                    }
                );
            }

            len = this._pipes.length;
            for(var i = 0; i < len;i++) {
                var p = this._pipes[i];

                  if(i === 0) {

                    score += p.x === bird.x ? 1 : 0;  // if pipe and bird horizontaly equal

                    var cx = Math.min(Math.max(bird.x, p.x), p.x + p.width);
                    var cy1 = Math.min(Math.max(bird.y, p.y), p.y + p.height);
                    var cy2 = Math.min(Math.max(bird.y, p.y + p.height + 80 ), p.y + 80 +2 * p.height);

                      var dx = bird.x - cx;
                      var dy1 = bird.y - cy1;
                      var dy2 = bird.y - cy2;

                      var d1 = dx * dx + dy1 * dy1;
                      var d2 = dx * dx + dy2 * dy2;

                      var r = bird.radius * bird.radius;

                      if(r > d1 || r > d2) {
                          currentState = states.Score;
                      }
                  }

                  p.x -= 2;
                  if(p.x < -p.width) {
                      this._pipes.splice(i,1);
                      i--;
                      len --;
                  }
          }
      },
      draw : function(context) {
          for(var i= 0,len = this._pipes.length;i < len;i++) {
              var p = this._pipes[i];
              s_pipeSouth.draw(context, p.x, p.y);
              s_pipeNorth.draw(context, p.x, p.y+80+ p.height);
          }
      }
    };

    function onpress(evt) {

        switch (currentState) {

            case states.Splash:
                currentState = states.Game;
                bird.jump();
                break;

            case states.Game:
                bird.jump();
                break;

            case states.Score:
                var mx = evt.offsetX,my = evt.offsetY;

                if(mx == null || my == null) {
                    pipes.reset();
                    currentState = states.Splash;
                    score = 0;                }
                else {
                    if(okbtn.x < mx && mx < okbtn.x + okbtn.width && okbtn.y < my && my < okbtn.y + okbtn.height)
                    {
                        pipes.reset();
                        currentState = states.Splash;
                        score = 0;
                    }
                }

                break;

                /*var mx = evt.offsetX,my = evt.offsetY;

                if(mx == null || my == null) {
                    mx = evt.touches[0].clientX;
                    my = evt.touches[0].clientY;
                }

                if(okbtn.x < mx && mx < okbtn.x + okbtn.width && okbtn.y < my && my < okbtn.y + okbtn.height)
                {
                    pipes.reset();
                    currentState = states.Splash;
                    score = 0;
                }
                break;*/
        }

    }

    function main() {

        canvas = document.createElement("canvas");

        width = window.innerWidth;
        height = window.innerHeight;

        var event = "touchstart";

        if(width >= 500) {
            width = 320;
            height = 480;

            canvas.style.border = "1px solid #000";
            event = "mousedown";
        }

        document.addEventListener(event,onpress);
        document.addEventListener("keydown",function(e) {
            if(e.keyCode === 32)
            {
                onpress(e);
            }
        })

        canvas.width = width;
        canvas.height = height;

        context = canvas.getContext("2d");
        currentState = states.Splash;
        document.body.appendChild(canvas);

        var img = new Image();
        img.onload = function() {
            initSprites(this);
            context.fillStyle = s_bg.color;

            okbtn = {
               x : ( width - s_buttons.Ok.width )/2,
                y : height - 200,
                width : s_buttons.Ok.width,
                height : s_buttons.Ok.height
            };

            run();
        }

        img.src = "res/sheet.png";
    }

    function run() {
        var loop = function() {
            update();
            render();
            window.requestAnimationFrame(loop,canvas);
        }
        window.requestAnimationFrame(loop,canvas);
    }

    function update() {
           frame++;

           if(currentState !== states.Score) {
               fgpos = (fgpos - 2) % 14;
           }
           else {
               best = Math.max(best,score);
           }

           if(currentState === states.Game) {
               pipes.update();
           }

           bird.update();

    }

    function render() {
        context.fillRect(0,0,width,height);

        s_bg.draw(context,0,height - s_bg.height);
        s_bg.draw(context,s_bg.width,height - s_bg.height);

        bird.draw(context);
        pipes.draw(context);

        s_fg.draw(context,fgpos,height - s_fg.height);
        s_fg.draw(context,fgpos+s_fg.width,height - s_fg.height);

        var width2 = width / 2;

        // splash screen state
        if(currentState === states.Splash) {
            s_splash.draw(context,width2 - s_splash.width / 2,height - 300);
            s_text.GetReady.draw(context,width2 - s_text.GetReady.width/2,height - 380);
        }

        // scroe state
        if(currentState === states.Score) {
            s_text.GameOver.draw(context,width2 - s_text.GameOver.width / 2,height - 400);
            s_score.draw(context,width2 - s_score.width / 2,height - 340);
            //s_medals[0].draw(context,width2 - s_medals[0].width / 2,height - 340);


            s_buttons.Ok.draw(context,okbtn.x,okbtn.y);

            s_numberS.draw(context,width2 - 47,height - 304,score,null,10);
            s_numberS.draw(context,width2 - 47,height - 262,best,null,10);
        }
        else {
            s_numberB.draw(context,null,20,score,width2);
        }
    }


    main();
