// List of all disorders:
var allDisorder =[ "Major depressive episode","Bipolar disorder","Dysthymia",
              "Panic disorder","Generalized anxiety disorder","Social phobia","Specific phobia","Agoraphobia","PTSD","Obsessive compulsive disorder","Adult separation anxiety disorder","Child separation anxiety disorder",
              "Anorexia nervosa","Bulimia nervosa","Binge eating disorder","Intermittent explosive disorder","ADHD","Conduct disorder","Oppositional defiant disorder",
              "Nicotine dependence","Alcohol abuse","Alcohol dependence","Drug abuse","Drug dependence"]

// List of all groups
var allGroup = ["Mood disorder", "Anxiety disorder", "Impulse-control disorder", "Substance-use disorder"]

// A scale that returns the group of a disorder:
var myGroup = d3.scaleOrdinal()
  .domain(allDisorder)
  .range([allGroup[0], allGroup[0], allGroup[0],
          allGroup[1], allGroup[1], allGroup[1], allGroup[1], allGroup[1], allGroup[1], allGroup[1], allGroup[1], allGroup[1],
          allGroup[2], allGroup[2], allGroup[2], allGroup[2], allGroup[2], allGroup[2], allGroup[2],
          allGroup[3], allGroup[3], allGroup[3], allGroup[3], allGroup[3]]);

// A scale that returns the short name of a disorder:
var giveShortName = d3.scaleOrdinal()
  .domain(allDisorder)
  .range([ "Depression","Bipolar","Dysthymia",
                "Panic disorder","Anxiety","Social phobia","Specific phobia","Agoraphobia","PTSD","Obsessive compulsive","Adult sep. anxiety","Child sep. anxiety",
                "Anorexia","Bulimia","Binge eating","Intermittent explosive","ADHD","Conduct disorder","Oppositional defiant",
                "Nicotine dependence","Alcohol abuse","Alcohol dependence","Drug abuse","Drug dependence"]);

// A scale that returns the very short name of a disorder:
var giveVeryShortName = d3.scaleOrdinal()
  .domain(allDisorder)
  .range([ "Depression","Bipolar","Dysthymia",
                "Panic","Anxiety","Soc. phobia","Spe. phobia","Agoraphobia","PTSD","Obs. comp. dis.","Adult sep. anxiety","Child sep. anxiety",
                "Anorexia","Bulimia","Binge eating","Int. explosive","ADHD","Conduct disorder","Oppositional defiant",
                "Nicotine dep.","Alcohol abuse","Alcohol dep.","Drug abuse","Drug dep."]);


// A color scale for groups: group -> color
var col1 = "#482677FF", col2 = "#2D708EFF", col3 = "#29AF7FFF", col4 = "#B8DE29FF"
var myColor = d3.scaleOrdinal()
  .domain(allGroup)
  .range([col1, col2, col3, col4]);
