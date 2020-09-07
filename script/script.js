let text;
let array;
let classes;
let sortedClasses;

let currentSelected = 14;
let start = "Sekretariat";
let visitingPoints = new Array();


function loadText(){
     fetch("data/FallmerayerEntfernungen.txt")
     .then(function(response){
          return response.text();
     })
     .then(function(data){
          text = data;
          //console.log(text);

          textToArray();

          classes = new Map(); 
          
          let counter = 0;

          sortedClasses = new Array();
          for (let i = 0; i < array.length; i++) {
               let string = array[i].split(" ");
               if(!classes.has(string[0])){
                    if(sortedClasses.indexOf(string[0]) < 0) sortedClasses.push(string[0]);
                    classes.set(string[0], new Array());//new array in map

                    counter++;
               }
               classes.get(string[0]).push(new Neighbour(string[1], parseFloat(string[2])));
          }

          createCheckBoxesDestinationPoints();
          createCheckBoxesStartingPoint();
          document.getElementById(currentSelected).checked = true;
        
     });
}

function createCheckBoxesStartingPoint(){
     let boxesStarting = document.getElementById("input__starting-point");//for adding checkboxes

     for(let i = 0; i < sortedClasses.length; i++){
          let box = document.createElement("INPUT");
          box.setAttribute("type",  "checkBox");

          box.setAttribute("id",  i);
          box.setAttribute("onclick",  "selectOnlyOneCheckboxStart(this.id)");
          
          let label = document.createElement("LABEL");
          label.setAttribute("for", i);
          label.innerHTML = sortedClasses[i];
          boxesStarting.appendChild(box);//adding to div
          boxesStarting.appendChild(label);//adding to div
     }
}

function createCheckBoxesDestinationPoints(){
     sortedClasses.sort();

     let boxesDestianion = document.getElementById("input__destination-points");
     while(boxesDestianion.firstChild)
          boxesDestianion.removeChild(boxesDestianion.firstChild);

     for(let i = 0; i < sortedClasses.length; i++){
          if(i != currentSelected){
               let box = document.createElement("INPUT");
               box.setAttribute("type",  "checkBox");
     
               box.setAttribute("id",  ((i+1) * 10));
               box.setAttribute("onclick",  "addOrDeleteClassToDestination(this.id)");
               
               let label = document.createElement("LABEL");
               label.setAttribute("for", ((i+1) * 10));
               label.innerHTML = sortedClasses[i];
               boxesDestianion.appendChild(box);//adding to div
               boxesDestianion.appendChild(label);//adding to div
          }
     }
}

function selectOnlyOneCheckboxStart(id){
     console.log(currentSelected)
     document.getElementById(currentSelected).checked = false;
     document.getElementById(id).checked = true;
     currentSelected = id;
     visitingPoints = new Array();
     createCheckBoxesDestinationPoints();
}

function addOrDeleteClassToDestination(id){
     console.log(id/10-1);
     if(visitingPoints.indexOf(sortedClasses[id/10-1]) >= 0){
          visitingPoints.splice(visitingPoints.indexOf(sortedClasses[id/10-1]), 1);
     } else{
          visitingPoints.push(sortedClasses[id/10-1]);
     }
     
     let visitingPointsCopy = [...visitingPoints];//copy Of Array
     let optimal = findBestRoute(start, visitingPointsCopy, classes);
     let string = "";
     for(let i = 0; i < optimal.length; i++){
          if(i == 0){
               string += " " + optimal[i];
          } else{
               string += "-> " + optimal[i];
          }
     }
     document.getElementById("result__text").innerText = string;
}


function textToArray(){
     array = text.split(/\r?\n/);
     for (let index = 0; index < array.length; index++) {
          console.log(array[index]);         
     }
}

function findBestRoute(start, destinations, classes){
     const goalAmount = destinations.length;
     let optimal = new Array();

     let current = start;

     for(let i = 0; i < goalAmount; i++){
          optimal[i] = dijkstra(current, destinations, classes);
          current = optimal[i];
          console.log("\n" + current + "\n");
     }
     return optimal;
}

function dijkstra(current, destinations, classes){
     let queue = new PriorityQueue({ comparator: function(a, b) { return a.cost - b.cost;}});
     
     let neighboursCur = classes.get(current);
     for(let i = 0; i < neighboursCur.length; i++){
          queue.queue(neighboursCur[i]);
     }

     let alreadyUsed = new Array();
     alreadyUsed.push(current);
     

     while(!destinations.includes(queue.peek().neighbour)){
          let cur = queue.dequeue();
          //console.log(cur.neighbour);

          let neighbours = classes.get(cur.neighbour);

          if(neighbours != null && !alreadyUsed.includes(cur.neighbour)){
               for(let i = 0; i < neighbours.length; i++){
                    if(!alreadyUsed.includes(neighbours[i].neighbour)){
                         queue.queue(new Neighbour(neighbours[i].neighbour, cur.cost + neighbours[i].cost));
                    }
               }
          } else{
               //console.log(cur.neighbour + "  :(");
          }
          alreadyUsed.push(cur.neighbour)
     }

     const index = destinations.indexOf(queue.peek().neighbour);
     console.log(index);
     if (index > -1) {
          destinations.splice(index, 1);
     }
     let returnValue = String(queue.peek().neighbour);
     return returnValue;
}