# ----------
# A script that takes data from Carmen and 
# transform it for the web application
# Output .json files
# ----------

library(tidyverse)
library(jsonlite)
setwd("~/Desktop/Como-in-World-Heath-Survey/DATA")


# ----------
# A function to reformat names in data
# ----------
reformatNames <- function(data){
  output <- data %>%
    
    # Lower vs Upper case
    mutate(Later_disorder = gsub("Specific Phobia", "Specific phobia", Later_disorder)) %>%
    mutate(Later_disorder = gsub("Anorexia Nervosa", "Anorexia nervosa", Later_disorder)) %>%
  
    mutate(Prior_disorder = gsub("ODD", "Oppositional defiant disorder", Prior_disorder)) %>%
    mutate(Later_disorder = gsub("ODD", "Oppositional defiant disorder", Later_disorder)) %>%
    
    mutate(Prior_disorder = gsub("Child SAD", "Child separation anxiety disorder", Prior_disorder)) %>%
    mutate(Later_disorder = gsub("Child SAD", "Child separation anxiety disorder", Later_disorder)) %>%
    
    mutate(Prior_disorder = gsub("GAD", "Generalized anxiety disorder", Prior_disorder)) %>%
    mutate(Later_disorder = gsub("GAD", "Generalized anxiety disorder", Later_disorder)) %>%
    
    mutate(Prior_disorder = gsub("OCD", "Obsessive compulsive disorder", Prior_disorder)) %>%
    mutate(Later_disorder = gsub("OCD", "Obsessive compulsive disorder", Later_disorder)) %>%
    
    mutate(Prior_disorder = gsub("IED", "Intermittent explosive disorder", Prior_disorder)) %>%
    mutate(Later_disorder = gsub("IED", "Intermittent explosive disorder", Later_disorder)) %>%
    
    mutate(Prior_disorder = gsub("MDE", "Major depressive episode", Prior_disorder)) %>%
    mutate(Later_disorder = gsub("MDE", "Major depressive episode", Later_disorder)) %>%
    
    mutate(Prior_disorder = gsub("Adult SAD", "Adult separation anxiety disorder", Prior_disorder)) %>%
    mutate(Later_disorder = gsub("Adult SAD", "Adult separation anxiety disorder", Later_disorder)) %>%

    mutate(Prior_disorder = gsub("AGO", "Agoraphobia", Prior_disorder)) %>%
    mutate(Later_disorder = gsub("AGO", "Agoraphobia", Later_disorder))
  
  
  return(output)
}





# ----------
# Load data + General changes necessary for all charts
# ----------

# Load data
data <- read.table("COMO_W_longformat_Yan_02Apr19.csv", header=T, sep=",")

# Change colnames
colnames(data)[1:2] <- c("Prior_disorder", "Later_disorder")

# Upper / Lower case issues
data <- reformatNames(data)

# List of Prior and Later disorder:
unique(data$Prior_disorder) %>% sort #24
unique(data$Later_disorder) %>% sort #25
unique(data$Prior_disorder) %>% sort ==  unique(data$Later_disorder) %>% sort




# ----------
# Preparation for dotplot histogram
# ----------

# Compute position for dotplot histogram
bin <- 1
don <- data %>%
  filter(Model == "A" & Sex == "All") %>%
  arrange(HR) %>%
  mutate(HR_rounded = round(HR/bin)*bin ) %>%
  mutate(y=ave(HR_rounded, HR_rounded, FUN=seq_along)) %>%
  filter(!is.na(HR))

# Write result at a .js object
tosave <- paste("dataHistogram = ", toJSON(don))
fileConn<-file("dataHistogram.js")
writeLines(tosave, fileConn)
close(fileConn)








# ----------
# Preparation for the heatmap
# ----------

# No filter
don <- data

# Rename sex
don <- don
  mutate(Sex = gsub("M", "Male", Sex)) %>%
  mutate(Sex = gsub("F", "Female", Sex))
  
# Check evertyhing is OK
head(don)
summary(don)
unique(don$Prior_disorder)
unique(don$Later_disorder)
unique(data$Prior_disorder) %>% sort ==  unique(data$Later_disorder) %>% sort
don %>% filter(Prior_disorder=="IED")
# Not a lot of data for Anorexia Nervosa for instance:
don %>% filter(Later_disorder=="Anorexia nervosa")

# Write result at a .js object
tosave <- paste("dataHeatmap = ", toJSON(don))
fileConn<-file("dataHeatmap.js")
writeLines(tosave, fileConn)
close(fileConn)








# ----------
# Preparation for symmetry chart
# ----------

# Watch an example
#couple = c("Alcohol dependence", "Drug dependence")
#data %>% filter(Later_disorder %in% couple & Prior_disorder %in% couple)

# Merge with opposite direction. Expected length = 24*24 - 24 = 552
tmp <- data %>% filter(Model == "A" & Sex == "All")
tmp <- merge(tmp, tmp, by.x=c("Prior_disorder", "Later_disorder"), by.y=c("Later_disorder", "Prior_disorder")) %>%
  mutate(coefVar = (HR.y - HR.x) / max(c(HR.y, HR.x),na.rm=T) * 100) 

# Clean
tmp <- tmp %>% 
  select(-8, -9, -10, -11, -12) 
colnames(tmp) <- c(colnames(data), "coefvar")
tmp <- tmp %>%
  filter(!is.na(HR))
summary(tmp)

# Highest one?
#dataReady %>% arrange(coefvar) %>% head()
#dataReady %>% arrange(coefvar) %>% tail()

# Write result at a .js object
tosave <- paste("dataBarplot = ", toJSON(tmp))
fileConn<-file("dataBarplot.js")
writeLines(tosave, fileConn)
close(fileConn)

# Check
tmp %>% 
  filter(Later_disorder == "Adult separation anxiety disorder") %>%
  head()




# ----------
# Preparation for Sankey plot
# ----------

# Add space to outcome to make it different
tmp <- data %>% 
  mutate( Later_disorder = paste( Later_disorder, " ", sep="")) %>%
  filter(Model == "A" & Sex == "All") %>%
  filter(!is.na(HR))
head(tmp)
dim(tmp)

# Write result at a .js object
tosave <- paste("dataSankey = ", toJSON(tmp))
fileConn<-file("dataSankey.js")
writeLines(tosave, fileConn)
close(fileConn)



# Save it
#write.table(tmp, file="data_sankey.csv", quote=F, row.names=F, sep=",")

# Make a data frame with nodes
#nodes = data.frame( ID = c(as.character(unique(tmp$Prior_disorder)), as.character(unique(tmp$Later_disorder)) ) ) %>%

# Make a data frame with the links
#tmp$from <- match(tmp$Prior_disorder, nodes$ID)-1
#tmp$to <- match(tmp$Later_disorder, nodes$ID)-1
# Export to JSON




















# ----------
# Lagged HR -> Load data / Clean / export
# ----------

# Load data
data <- read.table("COMO_W_longformat_Yan_02April19_a.csv", header=T, sep=",")

# Change colnames
colnames(data) <- c("Prior_disorder", "Later_disorder", "Model", "Time", "Value", "Low", "High")

# Upper / Lower case issues + reformat names
data <- reformatNames(data)

# List of Prior and Later disorder:
unique(data$Prior_disorder) %>% sort #24
unique(data$Later_disorder) %>% sort #24
unique(data$Prior_disorder) %>% sort ==  unique(data$Later_disorder) %>% sort

# Remove missing data
data <- data %>% filter(!is.na(Value))
head(data)

# Write result at a .js object
tosave <- paste("dataEvolutionHR = ", toJSON(data))
fileConn<-file("dataEvolutionHR.js")
writeLines(tosave, fileConn)
close(fileConn)






# ----------
# Lagged ABSOLUTE
# ----------

# Load data
data <- read.table("COMO_W_absRiskSex.csv", header=T, sep=",")

# Select columns
data <- data %>% select(`prior.disorder`, `later.disorder`, tso, newf, newf_low, newf_high, model)

# Change colnames
colnames(data) <- c("Prior_disorder", "Later_disorder", "Time", "Value", "Low", "High", "Model")

# Upper / Lower case issues + reformat names
data <- reformatNames(data)

# List of Prior and Later disorder:
unique(data$Prior_disorder) %>% sort #24
unique(data$Later_disorder) %>% sort #24
unique(data$Prior_disorder) %>% sort ==  unique(data$Later_disorder) %>% sort

# Remove missing data
data <- data %>% filter(!is.na(Value))
head(data)



# ----------
# Lagged ABSOLUTE
# ----------

# Load data
don <- read.table("COMO_W_absRiskAOO.csv", header=T, sep=",")

# Select columns
don <- don %>% select(`prior.disorder`, `later.disorder`, tso, newf, newf_low, newf_high, model)

# Change colnames
colnames(don) <- c("Prior_disorder", "Later_disorder", "Time", "Value", "Low", "High", "Model")

# Upper / Lower case issues + reformat names
don <- reformatNames(don)

# List of Prior and Later disorder:
unique(don$Prior_disorder) %>% sort #24
unique(don$Later_disorder) %>% sort #24
unique(don$Prior_disorder) %>% sort ==  unique(don$Later_disorder) %>% sort

# Remove missing data
don <- don %>% filter(!is.na(Value))
head(don, 15)


# ----------
# SAVE
# ----------

# Bind
out <- rbind(data, don)

# Write result at a .js object
tosave <- paste("dataEvolutionAbsolute = ", toJSON(out))
fileConn<-file("dataEvolutionAbsolute.js")
writeLines(tosave, fileConn)
close(fileConn)





