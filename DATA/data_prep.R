# ----------
# A script that takes data from Carmen and 
# transform it for the web application
# Output .json files
# ----------

library(tidyverse)
library(jsonlite)
setwd("~/Desktop/Como-in-World-Heath-Survey/DATA")




# ----------
# Load data + General changes necessary for all charts
# ----------

# Load data
data <- read.table("COMO_W_longformat_Yan_02Apr19.csv", header=T, sep=",")

# Change colnames
colnames(data)[1:2] <- c("Prior_disorder", "Later_disorder")

# Upper / Lower case issues
data <- data %>% 
  mutate(Later_disorder = gsub("Specific Phobia", "Specific phobia", Later_disorder)) %>%
  mutate(Later_disorder = gsub("Anorexia Nervosa", "Anorexia nervosa", Later_disorder))

# Change to have real name:
data <- data %>%
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
  mutate(Later_disorder = gsub("Adult SAD", "Adult separation anxiety disorder", Later_disorder))

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

# Filter model
don <- data %>%
  filter(Model == "A" & Sex == "All")
  
# Write result at a .js object
tosave <- paste("dataHeatmap = ", toJSON(don))
fileConn<-file("dataHeatmap.js")
writeLines(tosave, fileConn)
close(fileConn)


head(don)
summary(don)
unique(don$Prior_disorder)
unique(don$Later_disorder)

don %>% filter(Prior_disorder=="IED")
don %>% filter(Later_disorder=="Anorexia nervosa")






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






