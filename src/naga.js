//                          OM Ganesha
// Srikanth Bemineni
// 04/16/2018

(function($){
    console.log("loading Naga...")
    $.fn.naga = function(options){

    function NagaEngine(element, options)
    {
        var nElement = element;
        var canvasElement = null;
        var selectOptions = {};
        var ctx=null;
        //Engine attributes
        var eattr = {'score':0,
                     'status':'Press space to start the game',
                     'status_code':'#EAB126',
                     'status_text_color':'black',
                     'game_started' : -1};
        _this = this
        const UP = 1;
        const DOWN = 2;
        const RIGHT = 3;
        const LEFT = 4;
        var direction = null;
        var snake = []
        var headx = 0;
        var heady = 0;
        var foodx = -1
        var foody = -1
        this.init = function(){
                  console.log("Naga init");
                  var default_options ={'version': "1.0",
                                        // 1 second for now
                                        'refresh_interval': 600,
                                        'num_unit_matrix': 50}
                  selectOptions  = $.extend({}, default_options, options);
                  $(nElement).append("<canvas tabindex='1' id='naga-canvas' style='border:1px solid black'>" +
                                     "Canvas is not supported on this browser" +
                                     "</canvas>");
                  canvasElement = $('#naga-canvas', $(nElement))[0];
                  h = getTextHeight('16px arial');
                  //4 for line sapcing and 3 lines at the bottom
                  selectOptions['text_display_height'] = (h.height + 4) * 4 
                  canvasElement.width = selectOptions['width']
                  canvasElement.height = selectOptions['height'] + selectOptions['text_display_height']
                  ctx = canvasElement.getContext("2d");
                  eattr['height'] = $(canvasElement).outerHeight(true);
                  eattr['width'] = $(canvasElement).outerWidth(true);
                  eattr['unit_height'] = selectOptions['width'] / selectOptions['num_unit_matrix'];
                  eattr['unit_width'] = selectOptions['width'] / selectOptions['num_unit_matrix'];
                  console.log("Canvas width " + eattr['width'])
                  console.log("Canvas height " + eattr['height'])
                  console.log("Unit width " + eattr['unit_width'])
                  console.log("Unit heigth " + eattr['unit_height'])
                  $(nElement).on('keydown',_keyPressed);
                  direction = RIGHT;
                  snake.unshift(direction)
                  // run once to draw the screen
                  this._run()
                  console.log(foodx)
                  console.log(foody)
        };

        this._run = function(e){
            clearScreen(0,0,selectOptions['width'],selectOptions['height'] + selectOptions['text_display_height'])
            drawStatus()
            var currentx = headx
            var currenty = heady
            var growSnake = false
            var dead = false
            var color="black"
            var coord_dict = {}
            for (var i = 0; i < snake.length; i++) {
                if(i == 0)
                {
                    drawBox(currentx, currenty)
                    drawCircle(currentx,currenty,eattr['unit_width'])
                    if(currentx == foodx && currenty == foody)
                    {
                        //food consumed
                        growSnake = true
                    }

                    //console.log("Drawing head " + currentx +  " " +  currenty)
                }
                else
                {
                    currentx = getX(currentx,snake[i])
                    currenty = getY(currenty,snake[i])
                    // Did you bite yourself
                    if(currentx == headx && currenty == heady)
                    {
                        dead = true
                    }

                    drawBox(currentx,currenty,color)
                    color = (color=="black")?"red":"black"
                }
                // If food is not set, then store the
                // coordinates to check if it conflicts with the food 
                // coordinates
                if(foodx == -1 ||foody == -1)
                {
                    coord_dict[currentx.toString()+currenty.toString()] = null
                }
            }

            if(foodx == -1 && foody == -1 )
            {
                //There is no food set yet
                foodx = randomCord(selectOptions['num_unit_matrix'], eattr['unit_width'])
                foody = randomCord(selectOptions['num_unit_matrix'], eattr['unit_height'])
                var search = foodx.toString() + foody.toString()
                while(coord_dict.hasOwnProperty(search))
                {
                   foodx = randomCord(selectOptions['num_unit_matrix'], eattr['unit_width'])
                   foody = randomCord(selectOptions['num_unit_matrix'], eattr['unit_height'])
                }
            }

            drawBox(foodx,foody)

            //Check for died

            // Moving snake 
            // 1. pop the last snake body 
            // 2. add new head, which is nothing but the direction
            // 3. change the second body position relative to the new head position
            
            if(growSnake)
            {
                // TO fix:: new food chances of overlapping on the snake body
                lastbodydirection = snake[snake.length-1]
                snake.push(notDirection(lastbodydirection))
                eattr['score'] += 1
                growSnake=false
                foodx = foody = -1
            }

            snake.pop()
            snake.unshift(direction)
            if(snake.length > 1){
                snake[1] = notDirection(direction)
            }


            headx = getX(headx,direction)
            heady = getY(heady,direction)
            if(headx > selectOptions['width'] || headx < 0 ||
               heady > selectOptions['height'] || heady < 0)
            {
                dead = true
            }

            if(dead)
            {
                eattr['status']  = "You are dead !!!. Press space to start a new game"
                eattr['status_code'] = "#F24C4E"
                eattr['status_text_color'] = 'black'
                clearInterval(eattr['game_started'])
                eattr['game_started'] = -1
                clearScreen(0,selectOptions['height'],selectOptions['width'],selectOptions['text_display_height'])
                drawStatus()
            }
        }

        function checkFoodPosition()
        {
            var currenty,currentx;
            currentx = headx
            currenty = heady
            for (var i = 1; i < snake.length; i++) {
                if(currentx == foodx && currenty == foody){
                    return false
                }
                currentx = getX(currentx,snake[i])
                currenty = getY(currenty,snake[i])
            }
            return true
        }

        function notDirection(direction){
            if(direction == RIGHT || direction == LEFT)
            {
                return (direction == RIGHT) ? LEFT:RIGHT
            }
            else if(direction == UP || direction == DOWN)
            {
                return (direction == UP) ? DOWN:UP
            }
        }

        _keyPressed = function(e){
            var code = e.keyCode || e.which;
            console.log("Code is " + code)
            if((code == 38 || code == 87) && (snake.length == 1 || direction != DOWN))
            {
                direction = UP
            }
            else if((code == 40 || code == 83)&& (snake.length == 1 || direction != UP))
            {
                direction = DOWN
            }
            else if((code == 37 || code == 65) && (snake.length == 1 || direction != RIGHT))
            {
                direction = LEFT
            }
            else if((code == 39 || code == 68)&& (snake.length == 1 || direction != LEFT))
            {
                direction = RIGHT
            }
            else if(code == 72)
            {
                if(selectOptions['refresh_interval'] > 100)
                {
                    selectOptions['refresh_interval'] -= 100
                }
                restart()
            }
            else if(code == 76)
            {
                if(selectOptions['refresh_interval'] < 1500)
                {
                    selectOptions['refresh_interval'] += 100
                }
                restart()
            }
            else if(code == 32)
            {
                //space start the game
                if(eattr['game_started'] == -1)
                {
                    eattr['score'] = 0
                    snake = []
                    direction = RIGHT;
                    snake.unshift(direction)
                    headx = heady = 0
                    foodx =foody = -1
                    eattr['game_started'] = setInterval(_this._run,selectOptions['refresh_interval'])
                    eattr['status'] = "Game started"
                    eattr['status_code'] = "#1FB58F"
                    eattr['status_text_color'] = 'black'
                }
            }

            e.preventDefault();
            e.stopPropagation();
            return;
        }

        function restart()
        {
            if(eattr['game_started'] != -1)
            {
                clearInterval(eattr['game_started'])
                eattr['game_started'] = setInterval(_this._run,selectOptions['refresh_interval'])
            }
        }

        function getX(x,direct)
        {
            //    '#'#
            if(direct == RIGHT){
                return x + eattr['unit_width']
            }
            // #'#'
            else if(direct == LEFT){
                return x - eattr['unit_width']
            }

            return x
        }

        function getY(y,direct)
        {
            //  #
            // '#'
            if(direct == UP){
                return y - eattr['unit_height']
            }
            //  '#'
            //  '#'
            else if(direct == DOWN){
                return y + eattr['unit_height']
            }

            return y
        }

        function drawStatus(){
            ctx.beginPath();
            ctx.moveTo(0, selectOptions['height']);
            ctx.lineTo(selectOptions['width'], selectOptions['height']);
            ctx.stroke();
            h = getTextHeight('16px arial');
            ctx.fillStyle = 'red';
            ctx.font = '16px arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            //Longest string 
            size = ctx.measureText("Down/S - Move down")
            afterthisheight = selectOptions['height'] + 4;
            
            //Line one
            ctx.fillStyle = eattr['status_code']
            ctx.fillRect(0 ,selectOptions['height'] + 1 , selectOptions['width'], h.height + 4 )
            ctx.fillStyle = eattr['status_text_color']
            ctx.fillText(eattr['status'], 4, afterthisheight);
            var score = 'Speed:' + (15 - (selectOptions['refresh_interval']/100)) + '  Score:' + eattr['score']
            scorewidth = ctx.measureText(score)
            ctx.fillText(score , selectOptions['width'] - 10 - scorewidth.width , afterthisheight )

            ctx.fillStyle = 'red'
            //Line two 
            ctx.fillText('Up/W - Move up', 4, afterthisheight + h.height + 4)
            ctx.fillText('Left/A - Move left', size.width + 30 , afterthisheight + h.height + 4)

            //Line three
            ctx.fillText('Down/S - Move down', 4, afterthisheight + ((h.height + 4) * 2) )
            ctx.fillText('Right/D - Move right', size.width + 30, afterthisheight + ((h.height + 4) * 2) )

            //Line four
            ctx.fillText('H - Increase speed', 4, afterthisheight + ((h.height + 4) * 3) )
            ctx.fillText('L - Decrease speed', size.width + 30, afterthisheight + ((h.height + 4) * 3) )
        }

        function drawBox(x, y, color="red"){
            ctx.fillStyle = color;
            ctx.fillRect(x,y,eattr['unit_width'],eattr['unit_height']);
        }

        function drawCircle(x,y,width,color="black")
        {
            ctx.beginPath();
            var radius = width/2
            ctx.arc(x+radius,y+radius,radius-2,0,2*Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
        }

        function clearScreen(x,y,width,height){
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(x,y,width,height)
        }

        function randomCord(max, unit_length) {
            var t = Math.floor(Math.random() * max)
            return ( Math.floor(t) * unit_length )
        }

        function getTextHeight(font) {
            var text = $('<span>Hgy</span>').css({ fontFamily: font });
            var block = $('<div style="display: inline-block; width: 1px; height: 0px;"></div>');
            var div = $('<div></div>');
            div.append(text, block);
            var body = $('body');
            body.append(div);
            try {
                var result = {};
                block.css({ verticalAlign: 'baseline' });
                result.ascent = block.offset().top - text.offset().top;
                block.css({ verticalAlign: 'bottom' });
                result.height = block.offset().top - text.offset().top;
                result.descent = result.height - result.ascent;
            } finally {
                div.remove();
            }
            return result;
        };

        this.init();
    }

    var selectInstance=null;

    if(typeof options === 'string')
         {
             var args = Array.prototype.slice.call(arguments,1);
             this.each(function(){
                selectInstance = $.data(this,"_naga");
                if(!selectInstance)
                {
                    console.error("The select instance is not yet initialized");
                    return;
                }
                else if(!$.isFunction(selectInstance[options]) || options.charAt(0) == '_')
                {
                    console.warn("No function by that name exits in this object");
                return;
                }
                selectInstance[options].call(selectInstance,args);
             });
         }
         else
         {
            this.each(function(){
                 selectInstance = $.data(this, "_naga");
                 if(!selectInstance)
                 {
                    selectInstance = new NagaEngine(this,options);
                    $.data(this,"_naga",selectInstance);
                 }
            });
         }
    }
})(jQuery)