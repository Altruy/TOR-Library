var express = require('express');
var mysql = require('mysql');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');

var connection = mysql.createPool({

    connectionLimit: 50,
    host: 'us-cdbr-east-02.cleardb.com',
    user: 'b7204a7910e07b',
    password : '2126ca64',
    database : 'heroku_08548db875c4968'
    
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('css'));
app.use(express.static('fonts'));
app.use(express.static('images'));
app.use(express.static('js'));
app.set('view engine','ejs');
app.set('views', path.join(__dirname, '/pages'));

app.get('/',function( _ ,resp) {
    resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:0});
})

app.get('/employee/:E_ID/:name',function( req ,resp) {
    resp.render(path.join(__dirname +'/pages'+ '/employee.ejs'),{name:req.params.name,E_ID:req.params.E_ID});
})

app.get('/librarian/:E_ID/:name',function( req ,resp) {
    resp.render(path.join(__dirname +'/pages'+ '/librarian.ejs'),{name:req.params.name,E_ID:req.params.E_ID});
})

app.get('/finance/:E_ID/:name',function( req ,resp) {
    connection.getConnection(function(error,tempConn){
        if(error){
            console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
        } else {
            tempConn.query(`SELECT * FROM EMPLOYEES WHERE E_ID != 0 ORDER BY E_Name` , function(error , rows , _){
                if(error){
                    console.log(error);
                    resp.redirect('/');
                } else {
                    tempConn.query(`SELECT * FROM MEMBERS WHERE M_ID != 0 ORDER BY Name` , function(error , rowss , _){
                        if(error){
                            console.log(error);
                            resp.redirect('/');
                        } else {
                            
                            resp.render(path.join(__dirname +'/pages'+ '/finance.ejs'),{E_ID:req.params.E_ID,name:req.params.name,
                            LName: req.body.LName, Price: req.body.Price, Available: req.body.Available, rows: rows, rowss: rowss, clicked:req.params.clicked});
                        }
                    });
                }
            });
            tempConn.release();
        };
    })
})

app.get('/member/:M_ID/:name',function( req ,resp) {
    connection.getConnection(function(error,tempConn){
        if(error){
            console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
        } else {
            tempConn.query(`SELECT LITERATURE.L_ID, LITERATURE.Name 
                FROM LITERATURE JOIN LITERATURE_LOG ON LITERATURE.L_ID = LITERATURE_LOG.L_ID 
                WHERE LITERATURE_LOG.M_ID = ${parseInt(req.params.M_ID)} AND LITERATURE_LOG.Type = 'BORROW' AND 
                LITERATURE.L_ID NOT IN ( SELECT LITERATURE.L_ID
                FROM LITERATURE JOIN LITERATURE_LOG ON LITERATURE.L_ID = LITERATURE_LOG.L_ID 
                WHERE LITERATURE_LOG.M_ID = ${parseInt(req.params.M_ID)} AND LITERATURE_LOG.Type = 'RETURN')
                ORDER BY Name` 
                        ,function(error , rows , _){
                if(error){
                    console.log(error);
                } else {
                    
                    resp.render(path.join(__dirname +'/pages'+ '/member.ejs'),{M_ID:req.params.M_ID,name:req.params.name,rows:rows,feed:0});
                }
            });
            
            tempConn.release();
        }
    })
});

app.post('/member/:M_ID/:name',function( req ,resp) {
    connection.getConnection(function(error,tempConn){
        if(error){
            console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
        } else {
            tempConn.query(`SELECT LITERATURE.L_ID, LITERATURE.Name 
                FROM LITERATURE JOIN LITERATURE_LOG ON LITERATURE.L_ID = LITERATURE_LOG.L_ID 
                WHERE LITERATURE_LOG.M_ID = ${parseInt(req.params.M_ID)} AND LITERATURE_LOG.Type = 'BORROW' AND 
                LITERATURE.L_ID NOT IN ( SELECT LITERATURE.L_ID
                FROM LITERATURE JOIN LITERATURE_LOG ON LITERATURE.L_ID = LITERATURE_LOG.L_ID 
                WHERE LITERATURE_LOG.M_ID = ${parseInt(req.params.M_ID)} AND LITERATURE_LOG.Type = 'RETURN')
                ORDER BY Name` 
                        ,function(error , rows , _){
                if(error){
                    console.log(error);
                } else {
                    
                    resp.render(path.join(__dirname +'/pages'+ '/member.ejs'),{M_ID:req.params.M_ID,name:req.params.name,rows:rows,feed:1});
                }
            });
            
            tempConn.release();
        }
    })
});

app.get('/maccount/:M_ID',function( req ,resp) {
    connection.getConnection(function(error,tempConn){
        if(error){
            console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
        } else {
            tempConn.query(`SELECT * FROM MEMBERS WHERE M_ID = ${parseInt(req.params.M_ID)}` , function(error , rows , _){
                if(error){
                    console.log(error);
                    resp.redirect('/');
                } else {
                    row=rows[0]
                    resp.render(path.join(__dirname +'/pages'+ '/maccount.ejs'),{id:req.params.M_ID,name:row.Name,phone:row.Phone,address:row.Address,issued:row.Issued_books,dues:row.Dues,status:row.Status,clicked:'0'});
                }
            });
            tempConn.release();
        };
    })
    
})

app.get('/account/:E_ID',function( req ,resp) {
    connection.getConnection(function(error,tempConn){
        if(error){
            console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
        } else {
            tempConn.query(`SELECT * FROM EMPLOYEES WHERE E_ID = ${parseInt(req.params.E_ID)}` , function(error , rows , _){
                if(error){
                    console.log(error);
                    resp.redirect('/');
                } else {
                    row=rows[0]
                    resp.render(path.join(__dirname +'/pages'+ '/account.ejs'),{id:req.params.E_ID,E_ID:req.params.E_ID,name:row.E_Name,type:row.Type,cnic:row.CNIC,address:row.Residence,shift:row.Shift});
                }
            });
            tempConn.release();
        };
    })
    
})

app.get('/laccount/:E_ID',function( req ,resp) {
    connection.getConnection(function(error,tempConn){
        if(error){
            console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
        } else {
            tempConn.query(`SELECT * FROM EMPLOYEES WHERE E_ID = ${parseInt(req.params.E_ID)}` , function(error , rows , _){
                if(error){
                    console.log(error);
                    resp.redirect('/');
                } else {
                    row=rows[0]
                    resp.render(path.join(__dirname +'/pages'+ '/laccount.ejs'),{id:req.params.E_ID,name:row.E_Name,type:row.Type,cnic:row.CNIC,address:row.Residence,shift:row.Shift});
                }
            });
            tempConn.release();
        };
    })
    
})

app.get('/faccount/:E_ID',function( req ,resp) {
    connection.getConnection(function(error,tempConn){
        if(error){
            console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
        } else {
            tempConn.query(`SELECT * FROM EMPLOYEES WHERE E_ID = ${parseInt(req.params.E_ID)}` , function(error , rows , _){
                if(error){
                    console.log(error);
                    resp.redirect('/');
                } else {
                    row=rows[0]
                    resp.render(path.join(__dirname +'/pages'+ '/faccount.ejs'),{id:req.params.E_ID,E_ID:req.params.E_ID,name:row.E_Name,type:row.Type,cnic:row.CNIC,address:row.Residence,shift:row.Shift});
                }
            });
            tempConn.release();
        };
    })
    
})

app.get('/signout/:id/:clicked',function(req,resp){
    connection.getConnection(function(error,tempConn){
        if(error){
            console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
        } else {
            if(req.params.clicked==='0'){
                tempConn.query(`INSERT INTO EMPLOY_LOG(E_ID,Type) VALUES(${req.params.id},'SIGNOUT')`, function(error , rows , _){
                    if(error){
                        console.log(error);
                    } else {
                        resp.redirect(`/`);
                    }
                });
            }
            else {
                tempConn.query(`INSERT INTO EMPLOY_LOG(M_ID,Type) VALUES(${req.params.id},'SIGNOUT')`, function(error , rows , _){
                    if(error){
                        console.log(error);
                    } else {
                        resp.redirect(`/`);
                    }
                });
            }
        }
        tempConn.release();
    })
})

app.post('/signin',function( req ,resp ) {
    connection.getConnection(function(error,tempConn){
        if(error){
            console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
        } else {
            if (req.body.person_type === 'Employee' ){
                tempConn.query("SELECT * FROM EMPLOYEES" , function(error , rows , _){
                    if(error){
                        console.log(error);
                    } else {

                        
                        let result = rows.filter(user => {
                            return user.E_ID === parseInt(req.body.ID) && user.Password == req.body.password;
                        })
                        if (result.length === 1){
                            if (result[0].Active!==1){
                                resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:2});
                            }
                            else{
                                tempConn.query(`INSERT INTO EMPLOY_LOG(E_ID,Type) VALUES(${result[0].E_ID},'SIGNIN')`, function(error , rows , _){
                                    if(error){
                                        console.log(error);
                                    } else {
                                        if (result[0].Type==='Librarian'){
                                            resp.redirect(`/librarian/${req.body.ID}/${result[0].E_Name}`);
                                        }
                                        else if (result[0].Type==='Finance'){
                                            resp.redirect(`/finance/${req.body.ID}/${result[0].E_Name}`);
                                        } else if (result[0].Type==='admin'){
                                            resp.redirect(`/employee/${req.body.ID}/${result[0].E_Name}`);
                                        }
                                    }
                                });
                            
                        }
                        }
                        else {
                            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:1});
                        }
                    }
                });
                
            } else {
                tempConn.query(`SELECT * FROM MEMBERS WHERE M_ID = ${parseInt(req.body.ID)}`, function(error , rows , _){
                    if(error){
                        console.log(error);
                    } else {
                        let result = rows.filter(user => {
                            return user.M_ID === parseInt(req.body.ID) && user.Password == req.body.password;
                        })
                        if (result.length === 1){
                            if(result[0].Active===1){
                                tempConn.query(`INSERT INTO EMPLOY_LOG(M_ID,Type) VALUES(${result[0].M_ID},'SIGNIN')`, function(error , rows , _){
                                    if(error){
                                        console.log(error);
                                    } else {
                                        resp.redirect(`/member/${result[0].M_ID}/${result[0].Name}`);
                                    }
                                });
                            }
                            else{
                                resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:2});
                            }
                        }
                        else {
                            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:1});
                        }
                    }
                });

            }
            
            tempConn.release();
        }
    })
})

app.post('/search-req/:M_ID/:name',function( req ,resp ) {
    connection.getConnection(function(error,tempConn){
        if(error){
            console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
        } else {
            
            let key_word='%'+req.body.key_word.split(' ').join('%')+'%';
            let Category=req.body.Category.split(' ');
            let Genre=req.body.Genre;
            if (typeof(Genre) === 'string' ){
                Genre = '%'+Genre+'%'
            }
            else if (typeof(Genre) === 'object'){
                Genre='%'+req.body.Genre.join('%')+'%';
            }
            else {
                Genre = '%';
            }
            tempConn.query(`SELECT LITERATURE.L_ID,  LITERATURE.Name, AUTHORS.NAME, 
                        LITERATURE.Available, LITERATURE.No_Of_Copies ,LITERATURE.Price ,CATEGORIES.Category,CATEGORIES.Genre 
                        FROM LITERATURE,AUTHORS,CATEGORIES
                        WHERE (LITERATURE.A_ID = AUTHORS.A_ID AND LITERATURE.L_ID =CATEGORIES.L_ID AND CATEGORIES.Genre LIKE '${Genre}' 
                        and CATEGORIES.Category LIKE '${Category}'  
                        AND (LITERATURE.Name LIKE '${key_word}' OR AUTHORS.Name LIKE '${key_word}'))
                        ORDER BY LITERATURE.Name` 
                        ,function(error , rows , _){
                if(error){
                    console.log(error);
                } else {
                    
                    resp.render(path.join(__dirname +'/pages'+ '/mresult.ejs'),{id:req.params.M_ID,name:req.params.name,rows:rows});
                }
            });
            tempConn.release();
        }
    })
});

app.get('/mborrow/:M_ID/:L_ID/:clicked',function( req ,resp) {
    
    connection.getConnection(function(error,tempConn){
        if(error){
            console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
            } else {
                var person;
                var lit;
                tempConn.query(`SELECT * FROM MEMBERS WHERE M_ID = ${parseInt(req.params.M_ID)}` , function(error , rows , _){
                    if(error){
                        console.log(error);
                        resp.redirect('/');
                    } else {
                        
                        person=rows[0]
                        tempConn.query(`SELECT * FROM LITERATURE WHERE L_ID = ${parseInt(req.params.L_ID)}` , function(error , rows , _){
                            if(error){
                                console.log(error);
                                resp.redirect('/');
                            } else {
                                lit=rows[0]
                                resp.render(path.join(__dirname +'/pages'+ '/mborrow.ejs'),{id:req.params.M_ID,name:person.Name,issued:person.Issued_books,dues:person.Dues,status:person.Status,L_ID:lit.L_ID,LName: lit.Name, Price: lit.Price, Available: lit.Available, clicked:req.params.clicked});
                            }
                        });
                    }
                });
                tempConn.release();
            };
        })
})

app.get('/mreturn/:M_ID/:L_ID/:clicked',function( req ,resp) {
    
    
        connection.getConnection(function(error,tempConn){
            if(error){
                console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
            } else {
                var person;
                var lit;
                tempConn.query(`SELECT * FROM MEMBERS WHERE M_ID = ${parseInt(req.params.M_ID)}` , function(error , rows , _){
                    if(error){
                        console.log(error);
                        resp.redirect('/');
                    } else {
                        
                        person=rows[0]
                        tempConn.query(`SELECT * FROM LITERATURE WHERE L_ID = ${parseInt(req.params.L_ID)}` , function(error , rows , _){
                            if(error){
                                console.log(error);
                                resp.redirect('/');
                            } else {
                                lit=rows[0]
                                resp.render(path.join(__dirname +'/pages'+ '/mreturn.ejs'),{id:req.params.M_ID,name:person.Name,issued:person.Issued_books,dues:person.Dues,status:person.Status,L_ID:lit.L_ID,LName: lit.Name, Price: lit.Price, Available: lit.Available, clicked:req.params.clicked});
                            }
                        });
                    }
                });
                tempConn.release();
            };
        })
})

app.post('/mborrowdone',function( req ,resp) {
    var borr;
    var ret;
        connection.getConnection(function(error,tempConn){
            if(error){
                console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
            } else {
                tempConn.query(`SELECT count(L_ID) AS count
                                FROM LITERATURE_LOG 
                                WHERE M_ID =${parseInt(req.body.M_ID)} AND L_ID = ${parseInt(req.body.L_ID)} and Type = 'BORROW'` 
                            , function(error , rows , _){
                            if(error){
                                console.log(error);
                                resp.redirect('/');
                            } else {
                                borr = parseInt(rows[0].count);
                                tempConn.query(`SELECT count(L_ID) AS count
                                FROM LITERATURE_LOG 
                                WHERE M_ID =${parseInt(req.body.M_ID)} AND L_ID = ${parseInt(req.body.L_ID)} and Type = 'RETURN'` 
                            , function(error , row , _){
                            if(error){
                                console.log(error);
                                resp.redirect('/');
                            } else {
                                ret = parseInt(row[0].count);
                                if (ret-borr!==0){
                                    resp.redirect(`/mborrow/${parseInt(req.body.M_ID)}/${parseInt(req.body.L_ID)}/2`);
                                    return;
                                }
                                tempConn.query(`UPDATE MEMBERS
                                    SET Dues = ${parseFloat(req.body.Dues)+parseFloat(req.body.Price)}, Issued_books = ${parseInt(req.body.Issued_books)+1}
                                    WHERE M_ID = ${parseInt(req.body.M_ID)} ` 
                                    , function(error , rows , _){
                                    if(error){
                                        console.log(error);
                                        resp.redirect('/');
                                    } else {
                                        tempConn.query(`UPDATE LITERATURE SET Available =  ${parseInt(req.body.Available)-1} WHERE L_ID = ${parseInt(req.body.L_ID)}` 
                                        , function(error , rows , _){
                                        if(error){
                                            console.log(error);
                                            resp.redirect('/');
                                        } else {
                                            tempConn.query(`INSERT INTO LITERATURE_LOG( L_DATE, Type,L_ID,M_ID) values ('2020-11-18','BORROW', ${parseInt(req.body.L_ID)},${parseInt(req.body.M_ID)})` 
                                            , function(error , rows , _){
                                            if(error){
                                                console.log(error);
                                                resp.redirect('/');
                                            } else {
                                                
                                                
                                                resp.redirect(`/mborrow/${parseInt(req.body.M_ID)}/${parseInt(req.body.L_ID)}/1`)
                                            }
                                            });
                                        }
                                    });
                                    }
                                });
                            }
                        });
                            }
                        });
                
                
                tempConn.release();
            };
        })
    
});

app.post('/mreturndone',function( req ,resp) {
    var borr;
    var ret;
        connection.getConnection(function(error,tempConn){
            if(error){
                console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
            } else {
                tempConn.query(`SELECT count(L_ID) AS count
                                FROM LITERATURE_LOG 
                                WHERE M_ID =${parseInt(req.body.M_ID)} AND L_ID = ${parseInt(req.body.L_ID)} and Type = 'BORROW'` 
                            , function(error , rows , _){
                            if(error){
                                console.log(error);
                                resp.redirect('/');
                                } else {
                                    borr = parseInt(rows[0].count);
                                    tempConn.query(`SELECT count(L_ID) AS count FROM LITERATURE_LOG 
                                    WHERE M_ID =${parseInt(req.body.M_ID)} AND L_ID = ${parseInt(req.body.L_ID)} and Type = 'RETURN' ` 
                                , function(error , row , _){
                                if(error){
                                    console.log(error);
                                    resp.redirect('/');
                                } else {
                                    ret = parseInt(row[0].count);
                                    if (borr-ret!==1){
                                        resp.redirect(`/mreturn/${parseInt(req.body.M_ID)}/${parseInt(req.body.L_ID)}/2`);
                                        return;
                                    }
                                    tempConn.query(`UPDATE MEMBERS
                                    SET Issued_books = ${parseInt(req.body.Issued_books)-1}
                                    WHERE M_ID = ${parseInt(req.body.M_ID)} ` 
                                    , function(error , rows , _){
                                    if(error){
                                        console.log(error);
                                        resp.redirect('/');
                                    } else {
                                        tempConn.query(`UPDATE LITERATURE SET Available =  ${parseInt(req.body.Available)+1} WHERE L_ID = ${parseInt(req.body.L_ID)}` 
                                        , function(error , rows , _){
                                        if(error){
                                            console.log(error);
                                            resp.redirect('/');
                                        } else {
                                            tempConn.query(`INSERT INTO LITERATURE_LOG( L_DATE, Type,L_ID,M_ID) values ('2020-11-18','RETURN', ${parseInt(req.body.L_ID)},${parseInt(req.body.M_ID)})` 
                                            , function(error , rows , _){
                                            if(error){
                                                console.log(error);
                                                resp.redirect('/');
                                            } else {
                                                
                                                
                                                resp.redirect(`/mreturn/${parseInt(req.body.M_ID)}/${parseInt(req.body.L_ID)}/1`)
                                            }
                                            });
                                        }
                                    });
                                    }
                                });
                                }
                            });
                            }
                        });
                
                
                tempConn.release();
            };
        })
    
});

app.get('/clearDues/:M_ID/:clicked',function( req ,resp) {
    connection.getConnection(function(error,tempConn){
        if(error){
            console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
        } else {
            tempConn.query(`SELECT * FROM MEMBERS WHERE M_ID = ${parseInt(req.params.M_ID)}` , function(error , rows , _){
                if(error){
                    console.log(error);
                    resp.redirect('/');
                } else {
                    row=rows[0]
                    resp.render(path.join(__dirname +'/pages'+ '/clearDues.ejs'),{id:req.params.M_ID,name:row.Name,dues:row.Dues,clicked:req.params.clicked});
                }
            });
            tempConn.release();
        };
    })
    
})

app.post('/clearDuesdone',function( req ,resp) {
    
        connection.getConnection(function(error,tempConn){
            if(error){
                console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
            } else {
                tempConn.query(`INSERT INTO TRANSACTION_LOG(Amount,M_ID,T_ID,Type) VALUES(${parseFloat(req.body.Amount)}, ${parseInt(req.body.M_ID)}, ${parseInt(req.body.T_ID)},'DEBIT')` 
                            , function(error , rows , _){
                            if(error){
                                console.log(error);
                                resp.redirect('/');
                            } else {
                                tempConn.query(`UPDATE MEMBERS
                            SET Dues = ${parseFloat(req.body.Dues)-parseFloat(req.body.Amount)}
                            WHERE M_ID = ${parseInt(req.body.M_ID)} ` 
                            , function(error , rows , _){
                            if(error){
                                console.log(error);
                                resp.redirect('/');
                            } else {
                                resp.redirect(`/clearDues/${req.body.M_ID}/1`)
                            }
                        })
                            }
                        })
                tempConn.release();
            };
        })
    
});

app.get('/upgrade/:M_ID/:clicked',function( req ,resp) {
    connection.getConnection(function(error,tempConn){
        if(error){
            console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
        } else {
            tempConn.query(`SELECT * FROM MEMBERS WHERE M_ID = ${parseInt(req.params.M_ID)}` , function(error , rows , _){
                if(error){
                    console.log(error);
                    resp.redirect('/');
                } else {
                    row=rows[0]
                    resp.render(path.join(__dirname +'/pages'+ '/upgrade.ejs'),{id:req.params.M_ID,name:row.Name,dues:row.Dues,clicked:req.params.clicked});
                }
            });
            tempConn.release();
        };
    })
    
})

app.post('/upgradedone',function( req ,resp) {
    
        connection.getConnection(function(error,tempConn){
            if(error){
                console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
            } else {
                tempConn.query(`UPDATE MEMBERS
                            SET Status = 'senior'
                            WHERE M_ID = ${parseInt(req.body.M_ID)} ` 
                            , function(error , rows , _){
                            if(error){
                                console.log(error);
                                resp.redirect('/');
                            } else {
                                resp.redirect(`/upgrade/${req.body.M_ID}/1`)
                            }
                        })
                tempConn.release();
            };
        })
    
});

app.post('/edit-req/:M_ID/:name',function( req ,resp ) {
    connection.getConnection(function(error,tempConn){
        if(error){
            console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
        } else {
            let key_word='%'+req.body.key_word.split(' ').join('%')+'%';
            let Category=req.body.Category.split(' ');
            let Genre=req.body.Genre;
            if (typeof(Genre) === 'string' ){
                Genre = '%'+Genre+'%'
            }
            else if (typeof(Genre) === 'object'){
                Genre='%'+req.body.Genre.join('%')+'%';
            }
            else {
                Genre = '%';
            }
            tempConn.query(`SELECT LITERATURE.L_ID,  LITERATURE.Name, AUTHORS.NAME, 
                        LITERATURE.Available, LITERATURE.No_Of_Copies ,LITERATURE.Price ,CATEGORIES.Category,CATEGORIES.Genre 
                        FROM LITERATURE,AUTHORS,CATEGORIES
                        WHERE (LITERATURE.A_ID = AUTHORS.A_ID AND LITERATURE.L_ID =CATEGORIES.L_ID AND CATEGORIES.Genre LIKE '${Genre}' 
                        and CATEGORIES.Category LIKE '${Category}'  
                        AND (LITERATURE.Name LIKE '${key_word}' OR AUTHORS.Name LIKE '${key_word}'))
                        ORDER BY LITERATURE.Name` 
                        ,function(error , rows , _){
                if(error){
                    console.log(error);
                } else {
                    resp.render(path.join(__dirname +'/pages'+ '/lresult.ejs'),{id:req.params.M_ID,name:req.params.name,rows:rows});
                }
            });
            tempConn.release();
        }
    })
});

app.get('/ledit/:E_ID/:L_ID/:clicked',function( req ,resp) {
        connection.getConnection(function(error,tempConn){
            if(error){
                console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
            } else {
                var person;
                var lit;
                tempConn.query(`SELECT * FROM EMPLOYEES WHERE E_ID = ${parseInt(req.params.E_ID)}` , function(error , rows , _){
                    if(error){
                        resp.redirect('/');
                    } else {
                        
                        person=rows[0]
                        tempConn.query(`SELECT * FROM LITERATURE WHERE L_ID = ${parseInt(req.params.L_ID)}` , function(error , rows , _){
                            if(error){
                                resp.redirect('/');
                            } else {
                                lit=rows[0]
                                resp.render(path.join(__dirname +'/pages'+ '/ledit.ejs'),{id:req.params.E_ID,name:person.E_Name,issued:person.Issued_books,dues:person.Dues,status:person.Status,L_ID:lit.L_ID,LName: lit.Name, Price: lit.Price, Available: lit.Available, clicked:req.params.clicked});
                            }
                        });
                    }
                });
                tempConn.release();
            };
        })
})

app.post('/editdone',function( req ,resp) {
    if (isNaN(req.body.Available) || isNaN(req.body.Price) || parseFloat(req.body.Price)<=0 || parseInt(req.body.Available) <0 )
    {
        resp.redirect(`/ledit/${req.body.E_ID}/${req.body.L_ID}/2`);
    }
    else {
        connection.getConnection(function(error,tempConn){
            if(error){
                console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
            } else {
                tempConn.query(`UPDATE LITERATURE SET Available =  ${parseInt(req.body.Available)}, Price = ${parseFloat(req.body.Price)} 
                                WHERE L_ID = ${parseInt(req.body.L_ID)}` 
                                    , function(error , rows , _){
                                    if(error){
                                        console.log(error);
                                        resp.redirect('/');
                                    } else {
                                            
                                            resp.redirect(`/ledit/${req.body.E_ID}/${req.body.L_ID}/1`);
                                    }
                                });
                tempConn.release();
            };
        })
    }
});

app.post('/addnew/:E_ID/:name/:clicked',function( req ,resp) {
    
    connection.getConnection(function(error,tempConn){
        if(error){
            console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
        } else {
            tempConn.query(`SELECT * FROM AUTHORS ORDER BY Name` , function(error , rows , _){
                if(error){
                    console.log(error);
                    resp.redirect('/');
                } else {
                    
                    resp.render(path.join(__dirname +'/pages'+ '/addnew.ejs'),{id:req.params.E_ID,name:req.params.name,
                    LName: req.body.LName, Price: req.body.Price, Available: req.body.Available, Genre:req.body.Genre, rows: rows, clicked:req.params.clicked});
                }
            });
            tempConn.release();
        };
    })
})

app.post('/addnewdone',function( req ,resp) {
    
    if (isNaN(req.body.Available) || isNaN(req.body.Price) || parseFloat(req.body.Price)<=0 || parseInt(req.body.Available) <0 )
    {
        connection.getConnection(function(error,tempConn){
            if(error){
                console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
            }
            else{
            tempConn.query(`SELECT * FROM AUTHORS ` , function(error , rows , _){
                if(error){
                    console.log(error);
                    resp.redirect('/');
                } else {
                    
                    resp.render(path.join(__dirname +'/pages'+ '/addnew.ejs'),{id:req.body.E_ID,name:req.body.name,
                    LName: req.body.LName, Price: req.body.Price, Available: req.body.Available,Genre:req.body.Genre, rows: rows, clicked:'2'});
                }
        });}
        }
        );

    } else {
        connection.getConnection(function(error,tempConn){
            if(error){
                console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
            } else {
                tempConn.query(`SELECT * FROM LITERATURE 
                                WHERE Name =  '${req.body.LName}' AND A_ID = ${parseInt(req.body.author)}` 
                                    , function(error , rows , _){
                                    if(error){
                                        console.log(error);
                                        tempConn.query(`SELECT * FROM AUTHORS ` , function(error , rows , _){
                                            if(error){
                                                console.log(error);
                                                resp.redirect('/');
                                            } else {
                                                
                                                resp.render(path.join(__dirname +'/pages'+ '/addnew.ejs'),{id:req.body.E_ID,name:req.body.name,
                                                LName: req.body.LName, Price: req.body.Price,Genre:req.body.Genre, Available: req.body.Available, rows: rows, clicked:'2'});
                                            }
                                        });
                                    } else {
                                        if (rows.length > 0){
                                            tempConn.query(`SELECT * FROM AUTHORS ` , function(error , rowsa , _){
                                                if(error){
                                                    console.log(error);
                                                    resp.redirect('/');
                                                } else {
                                                    
                                                    resp.render(path.join(__dirname +'/pages'+ '/addnew.ejs'),{id:req.body.E_ID,name:req.body.name,
                                                    LName: req.body.LName, Price: req.body.Price,Genre:req.body.Genre, Available: req.body.Available, rows: rowsa, clicked:'3'});
                                                }
                                            });
                                        } else {
                                        tempConn.query(`INSERT INTO LITERATURE(Name,Available,No_Of_Copies,Price,A_ID) VALUES
                                        ('${req.body.LName}',${parseInt(req.body.Available)},${parseInt(req.body.Available)},
                                        ${parseFloat(req.body.Price)},${parseInt(req.body.author)})` 
                                            , function(error , rows , _){
                                            if(error){
                                                console.log(error);
                                                resp.redirect('/');
                                            } else {
                                                console.log(rows);
                                                tempConn.query(`SELECT L_ID FROM LITERATURE WHERE Name = '${req.body.LName}' AND A_ID =${parseInt(req.body.author)}`
                                                    , function(error , ro , _){
                                                    if(error){
                                                        console.log(error);
                                                        resp.redirect('/');
                                                    } else {
                                                        console.log("ro",ro);
                                                        tempConn.query(`INSERT INTO CATEGORIES(Category,Genre,L_ID) VALUES( '${req.body.Category}', '${req.body.Genre}', ${ro[0].L_ID})`
                                                    , function(error , _ , _){
                                                    if(error){
                                                        console.log(error);
                                                        resp.redirect('/');
                                                    } else {
                                                        tempConn.query(`SELECT * FROM AUTHORS ` , function(error , rowsa , _){
                                                            if(error){
                                                                console.log(error);
                                                                resp.redirect('/');
                                                            } else {
                                                                
                                                            resp.render(path.join(__dirname +'/pages'+ '/addnew.ejs'),{id:req.body.E_ID,name:req.body.name,
                                                            LName: req.body.LName, Price: req.body.Price,Genre:req.body.Genre, Available: req.body.Available, rows: rowsa, clicked:'1'});
                                                            }
                                                        }); 
                                                        }
                                                    }); 
                                                    }
                                                }); 
                                            }
                                        }); 
                                    }
                                    }
                                });
                tempConn.release();
            };
        })
    }
});

app.post('/edues/:E_ID/:name/:clicked',function( req ,resp) {
    
    connection.getConnection(function(error,tempConn){
        if(error){
            console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
        } else {
            tempConn.query(`SELECT * FROM EMPLOYEES WHERE E_ID = ${parseInt(req.body.employee)} ` , function(error , rows , _){
                if(error){
                    console.log(error);
                    resp.redirect('/');
                } else {
                    
                    resp.render(path.join(__dirname +'/pages'+ '/edues.ejs'),{E_ID:req.params.E_ID,id:req.params.E_ID,name:req.params.name,rows: rows[0], clicked:req.params.clicked});
                }
            });
            tempConn.release();
        };
    })
})

app.post('/eduesdone/:E_ID/:name',function( req ,resp) {

    connection.getConnection(function(error,tempConn){
        if(error){
            console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
        } else {
            tempConn.query(`INSERT INTO TRANSACTION_LOG(Amount,M_ID,T_ID,E_ID,Type) VALUES(${parseFloat(req.body.Amount)}, ${parseInt(req.body.E_ID)}, ${parseInt(req.body.T_ID)},${parseInt(req.params.E_ID)},'CREDIT')` , function(error , rows , _){
                if(error){
                    console.log(error);
                    resp.redirect('/');
                    // resp.redirect(`/finance/${req.params.E_ID}/${req.params.name}`);
                } else {
                    tempConn.query(`UPDATE EMPLOYEES SET Dues = ${parseFloat(req.body.Dues)-parseFloat(req.body.Amount)} WHERE E_ID = ${parseFloat(req.body.E_ID)}` , function(error , rows , _){
                        if(error){
                            console.log(error);
                            resp.redirect('/');
                            // resp.redirect(`/finance/${req.params.E_ID}/${req.params.name}`);
                        } else {
                            
                            let rows = {Dues :parseFloat(req.body.Dues)-parseFloat(req.body.Amount) , E_Name : req.body.Name }
                            resp.render(path.join(__dirname +'/pages'+ '/edues.ejs'),{E_ID:req.params.E_ID,id:req.params.E_ID,name:req.params.name,rows: rows, clicked:'1'});
                        }
                    });}
            });
            tempConn.release();
        };
    })
})

app.post('/emdues/:E_ID/:name/:clicked',function( req ,resp) {
    
    connection.getConnection(function(error,tempConn){
        if(error){
            console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
        } else {
            tempConn.query(`SELECT * FROM MEMBERS WHERE M_ID = ${parseInt(req.body.member)} ` , function(error , rows , _){
                if(error){
                    console.log(error);
                    resp.redirect('/');
                } else {
                    console.log(rows);
                    resp.render(path.join(__dirname +'/pages'+ '/emdues.ejs'),{E_ID:req.params.E_ID,id:req.params.E_ID,name:req.params.name,rows: rows[0], clicked:req.params.clicked});
                }
            });
            tempConn.release();
        };
    })
})

app.post('/emduesdone/:E_ID/:name',function( req ,resp) {

    connection.getConnection(function(error,tempConn){
        if(error){
            console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
        } else {
            tempConn.query(`UPDATE MEMBERS SET Dues = ${parseFloat(req.body.Dues)-parseFloat(req.body.Amount)} WHERE M_ID = ${parseInt(req.body.M_ID)}` , function(error , rows , _){
                if(error){
                    console.log(error);
                    resp.redirect(`/`);
                } else {
                    tempConn.query(`INSERT INTO TRANSACTION_LOG(Amount,M_ID,T_ID,E_ID,Type) VALUES(${parseFloat(req.body.Amount)}, ${parseInt(req.body.M_ID)}, ${parseInt(req.body.T_ID)},${parseInt(req.params.E_ID)},'DEBIT')` , function(error , rows , _){
                        if(error){
                            console.log(error);
                            resp.redirect(`/`);
                        } else {
                            
                            let rows = {Dues :parseFloat(req.body.Dues)-parseFloat(req.body.Amount) , Name : req.body.Name }
                            resp.render(path.join(__dirname +'/pages'+ '/emdues.ejs'),{E_ID:req.params.E_ID,id:req.params.E_ID,name:req.params.name,rows: rows, clicked:'1'});
                        }
                    });}
            });
            tempConn.release();
        };
    })
})

app.post('/trans/:E_ID/:name/:clicked',function( req ,resp) {
        connection.getConnection(function(error,tempConn){
            if(error){
                console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
            } else {
                tempConn.query(`SELECT TRANSACTION_LOG.T_DATE,TRANSACTION_LOG.Amount, MEMBERS.Name, EMPLOYEES.E_Name ,TRANSACTION_LOG.Type
                FROM TRANSACTION_LOG , MEMBERS , EMPLOYEES 
                WHERE TRANSACTION_LOG.M_ID = MEMBERS.M_ID and TRANSACTION_LOG.E_ID = EMPLOYEES.E_ID and TRANSACTION_LOG.T_DATE like '${req.body.date}%'
                ORDER BY TRANSACTION_LOG.T_DATE` , function(error , rows , _){
                    if(error){
                        console.log(error);
                        resp.redirect(`/`);
                    } else {
                        
                                resp.render(path.join(__dirname +'/pages'+ '/transactions.ejs'),{E_ID:req.params.E_ID,id:req.params.E_ID,name:req.params.name,rows: rows});
                            }
                });
                tempConn.release();
            };
        })
    // 
})

app.get('/view-e/:E_ID/:name/:clicked',function( req ,resp) {
    
        connection.getConnection(function(error,tempConn){
            if(error){
                console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
            } else {
                tempConn.query(`SELECT * FROM EMPLOYEES ORDER BY E_Name ` , function(error , rows , _){
                    if(error){
                        
                        resp.redirect('/');
                    } else {
                        
                        resp.render(path.join(__dirname +'/pages'+ '/view-e.ejs'),{id:req.params.E_ID,name:req.params.name, rows:rows,  clicked:req.params.clicked});
                    }
                });
                tempConn.release();
            };
        })
})

app.get('/view-m/:E_ID/:name/:clicked',function( req ,resp) {
        connection.getConnection(function(error,tempConn){
            if(error){
                console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
            } else {
                tempConn.query(`SELECT * FROM MEMBERS ORDER BY Name` , function(error , rows , _){
                    if(error){
                        
                        resp.redirect('/');
                    } else {
                        
                        resp.render(path.join(__dirname +'/pages'+ '/view-m.ejs'),{id:req.params.E_ID,name:req.params.name, rows:rows,  clicked:req.params.clicked});
                    }
                });
                tempConn.release();
            };
        })
})

app.post('/edit-e/:id/:name/:E_ID/:clicked',function( req ,resp) {
    
        connection.getConnection(function(error,tempConn){
            if(error){
                console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
            } else {
                tempConn.query(`SELECT * FROM EMPLOYEES WHERE E_ID = ${req.params.E_ID}` , function(error , rows , _){
                    if(error){
                        
                        resp.redirect('/');
                    } else {
                        
    
                        resp.render(path.join(__dirname +'/pages'+ '/edit-e.ejs'),{id:req.params.id,name:req.params.name, row:rows[0],  clicked:req.params.clicked});
                    }
                });
                tempConn.release();
            };
        })
})

app.post('/edit-m/:id/:name/:M_ID/:clicked',function( req ,resp) {
    
        connection.getConnection(function(error,tempConn){
            if(error){
                console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
            } else {
                tempConn.query(`SELECT * FROM MEMBERS WHERE M_ID = ${req.params.M_ID}` , function(error , rows , _){
                    if(error){
                        
                        resp.redirect('/');
                    } else {
                        
    
                        resp.render(path.join(__dirname +'/pages'+ '/edit-m.ejs'),{id:req.params.id,name:req.params.name, row:rows[0],  clicked:req.params.clicked});
                    }
                });
                tempConn.release();
            };
        })
})

app.post('/editdone/:id/:name',function( req ,resp) {
        connection.getConnection(function(error,tempConn){
            if(error){
                console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
            } else {
                tempConn.query(`UPDATE EMPLOYEES SET E_Name= '${req.body.E_Name}', Type = '${req.body.Type}' , CNIC = '${req.body.CNIC}' , 
                                Residence = '${req.body.Residence}', Dues = ${parseFloat(req.body.Dues)} , Password = '${req.body.Password}' , Active = ${parseInt(req.body.Active)} 
                                WHERE E_ID = ${req.body.E_ID}` , function(error , rows , _){
                    if(error){
                        console.log(error);
                        resp.redirect('/');
                    } else {
                        tempConn.query(`SELECT * FROM EMPLOYEES WHERE E_ID = ${req.body.E_ID}` , function(error , rows , _){
                            if(error){
                                
                                resp.redirect('/');
                            } else {
                                
            
                                resp.render(path.join(__dirname +'/pages'+ '/edit-e.ejs'),{id:req.params.id,name:req.params.name, row:rows[0],  clicked:'1'});
                            }
                        });
                    }
                });
                tempConn.release();
            };
        })
})

app.post('/meditdone/:id/:name',function( req ,resp) {
        connection.getConnection(function(error,tempConn){
            if(error){
                console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
            } else {
                tempConn.query(`UPDATE MEMBERS SET Name= '${req.body.Name}', Phone = '${parseFloat(req.body.Phone)}' , Issued_books = '${parseInt(req.body.Issued_books)}' , 
                                Address = '${req.body.Address}', Dues = ${parseFloat(req.body.Dues)} , Password = '${req.body.Password}' , Active = ${parseInt(req.body.Active)} 
                                WHERE M_ID = ${req.body.M_ID}` , function(error , rows , _){
                    if(error){
                        console.log(error);
                        resp.redirect('/');
                    } else {
                        tempConn.query(`SELECT * FROM MEMBERS WHERE M_ID = ${req.body.M_ID}` , function(error , rows , _){
                            if(error){
                                
                                resp.redirect('/');
                            } else {
                                
            
                                resp.render(path.join(__dirname +'/pages'+ '/edit-m.ejs'),{id:req.params.id,name:req.params.name, row:rows[0],  clicked:'1'});
                            }
                        });
                    }
                });
                tempConn.release();
            };
        })
})

app.get('/new-m/:id/:name/:clicked',function( req ,resp) {
    
    let rows = {
                M_ID: '-',
                Name: '',
                Phone: '',
                Address: '',
                Password: ''}
    resp.render(path.join(__dirname +'/pages'+ '/new-m.ejs'),{id:req.params.id,name:req.params.name, row:rows,  clicked:req.params.clicked});
})

app.post('/mnewdone/:id/:name',function( req ,resp) {
        connection.getConnection(function(error,tempConn){
            if(error){
                console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
            } else {
                tempConn.query(`SELECT * FROM MEMBERS WHERE Name= '${req.body.Name}' and  Password = '${req.body.Password}'` , function(error , roww , _){
                    if(error){
                        console.log(error);
                        resp.render(path.join(__dirname +'/pages'+ '/new-m.ejs'),{id:req.params.id,name:req.params.name, row:req.body,  clicked:'2'});
                    } else {
                        if (roww.length>0){
                            console.log('Exists',error);
                            resp.render(path.join(__dirname +'/pages'+ '/new-m.ejs'),{id:req.params.id,name:req.params.name, row:req.body,  clicked:'3'});
                        }
                        else{
                            tempConn.query(`INSERT INTO MEMBERS(Name,Phone,Address,Password) VALUES ( '${req.body.Name}','${parseFloat(req.body.Phone)}','${req.body.Address}', '${req.body.Password}')` , function(error , _ , _){
                                if(error){
                                    console.log(error);
                                    resp.render(path.join(__dirname +'/pages'+ '/new-m.ejs'),{id:req.params.id,name:req.params.name, row:req.body,  clicked:'2'});
                                } else {
                                    tempConn.query(`SELECT * FROM MEMBERS WHERE Name= '${req.body.Name}' and  Password = '${req.body.Password}'` , function(error , rows , _){
                                        if(error){
                                            console.log(error);
                                            resp.render(path.join(__dirname +'/pages'+ '/new-m.ejs'),{id:req.params.id,name:req.params.name, row:req.body,  clicked:'2'});
                                        } else {
                                            resp.render(path.join(__dirname +'/pages'+ '/new-m.ejs'),{id:req.params.id,name:req.params.name, row:rows[0],  clicked:'1'});
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
                tempConn.release();
            };
        })
})

app.post('/view-el/:E_ID/:name/:clicked',function( req ,resp) {
    connection.getConnection(function(error,tempConn){
        if(error){
            console.log(error);
            resp.render(path.join(__dirname + '/pages'+ '/index.ejs'),{clicked:3});
        } else {
            tempConn.query(`SELECT EMPLOY_LOG.E_DATE, MEMBERS.Name, EMPLOYEES.E_Name ,EMPLOY_LOG.Type
            FROM EMPLOY_LOG , MEMBERS , EMPLOYEES 
            WHERE EMPLOY_LOG.M_ID = MEMBERS.M_ID and EMPLOY_LOG.E_ID = EMPLOYEES.E_ID and EMPLOY_LOG.E_DATE like '${req.body.date}%'
            ORDER BY EMPLOY_LOG.E_DATE` , function(error , rows , _){
                if(error){
                    console.log(error);
                    resp.redirect(`/employee/${req.params.E_ID}/${req.params.name}`);
                } else {
                     resp.render(path.join(__dirname +'/pages'+ '/view-el.ejs'),{E_ID:req.params.E_ID,id:req.params.E_ID,name:req.params.name,rows: rows});
                    }
            });
            tempConn.release();
        };
    })
})

app.listen(process.env.PORT || 3000, 
	() => console.log("Server is running..."));