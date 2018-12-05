const SimpleOauth2 = require('simple-oauth2');
const express = require('express');
const next = require('next');
const jwt = require('jsonwebtoken');
const port = parseInt(process.env.PORT, 10) || 4000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({dev});
const handle = app.getRequestHandler();
const bodyParser = require('body-parser');
const request = require('request');
const grequest = require('graphql-request');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const sharp = require('sharp');
const acceptWebp = require('accept-webp');
const createLocaleMiddleware = require('express-locale');
const {Storage} = require('@google-cloud/storage');
const projectId = process.env.GOOGLE_STORAGE_PROJECT_ID;
const fs = require('fs');

app.prepare().then(() => {
  const server = express();
  //const staticPath = __dirname + '/tmp';
  const staticPath = '/tmp';

  server.use(acceptWebp(staticPath, ['jpg', 'jpeg', 'png']));
  server.use(express.static(staticPath));

  server.use(bodyParser.json());
  server.use(cookieParser());
  server.use(fileUpload());
  server.use(createLocaleMiddleware());
  server.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  );

  uploadToGCE = async (bucketName, filename) => {
    if (process.env.CDN) {
      console.log('lol');
      // [START storage_upload_file]
      // Imports the Google Cloud client library
      const {Storage} = require('@google-cloud/storage');

      // Creates a client
      const storage = new Storage();

      /**
       * TODO(developer): Uncomment the following lines before running the sample.
       */
      // const bucketName = 'Name of a bucket, e.g. my-bucket';
      // const filename = 'Local file to upload, e.g. ./local/path/to/file.txt';
      console.log(bucketName, filename);
      // Uploads a local file to the bucket
      await storage.bucket(bucketName).upload(filename, {
        destination: '/assets/' + filename.split('/').pop(),
        // Support for HTTP requests made with `Accept-Encoding: gzip`
        gzip: true,
        public: true,
        metadata: {
          // Enable long-lived HTTP caching headers
          // Use only if the contents of the file will never change
          // (If the contents will change, use cacheControl: 'no-cache')
          //cacheControl: 'public, max-age=31536000',
          cacheControl: 'no-cache',
        },
      });

      console.log(`${filename} uploaded to ${bucketName}.`);
      fs.unlink(filename, () => {
        console.log(`${filename} deleted from ${bucketName}.`);
      });
      // [END storage_upload_file]
    }
  };
  checkToken = (req, res, next) => {
    //console.log('cookies', req.cookies);
    const token = req.cookies.token;
    if (!token) {
      //console.log('no token');
      req.userId = null;
      req.token = null;
      req.github = null;
      req.linkedin = null;
      next();
      return;
    }

    jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
      if (err) {
        console.log('token not ok', err);
        req.userId = null;
        req.token = null;
        req.github = null;
        req.linkedin = null;
        next();
        return;
      } else {
        req.userId = decoded.userId;
        req.token = token;
        req.github = decoded.github;
        req.linkedin = decoded.linkedin;
        next();
        return;
      }
    });
  };
  server.use(checkToken);

  auth = async (req, res, next) => {
    const originalRes = res;
    if (req && req.query && req.query.code) {
      if (req.query.code.length < 30) {
        //github oauth
        const oauth2 = SimpleOauth2.create({
          client: {
            id: process.env.GITHUB_ID,
            secret: process.env.GITHUB_SECRET,
          },
          auth: {
            tokenHost: 'https://github.com',
            tokenPath: '/login/oauth/access_token',
            authorizePath: '/login/oauth/authorize',
          },
        });
        const options = {code: req.query.code};

        try {
          const result = await oauth2.authorizationCode.getToken(options);

          const otoken = oauth2.accessToken.create(result);
          const githubToken = result.access_token;
          var opts = {
            uri: 'https://api.github.com/graphql',
            json: true,
            headers: {
              Authorization: 'bearer ' + githubToken,
            },
            query: `
			  query getUser{
  viewer {
    login
    name
	bio
	  email
	  databaseId
	  avatarUrl
	  url
	  websiteUrl
	  followers {
      totalCount
}
pullRequests(last: 100, states: MERGED, orderBy: {direction: DESC, field: CREATED_AT}){
  nodes{
    url
	title
    repository{
      url
      nameWithOwner
	  owner{
        avatarUrl
	  }
      name
	  description
  stargazers{
    totalCount
  }
   primaryLanguage{
    name
    id
}
      languages(first: 100){
        nodes{
          name
          id
        }
      }
    }
    mergedBy{
      avatarUrl
      login
      url

    }
  }
}
repositoriesContributedTo(first: 100, orderBy: {direction: DESC, field: STARGAZERS}){
totalCount
nodes {
  id
  name
  primaryLanguage{
    name
    id
}
	  owner{
        avatarUrl

	}
  nameWithOwner
description
  url
  stargazers{
    totalCount
  }
  viewerCanAdminister
		languages(first: 25) {
          totalCount
		  edges {
			node {
              id
              name
              color

}

}

}

}

}

}

}

`,
          };
          const client = new grequest.GraphQLClient(opts.uri, {
            headers: opts.headers,
          });

          client
            .request(opts.query, {})
            .catch(err => {
              console.log(err, opts);
            })
            .then(data => {
              // now body and res.body both will contain decoded content.
              //
              console.log('viewerrrrrr', data);
              const bodyJson = data.viewer;

              const checkUserRequestopts = {
                uri: process.env.HASURA,
                json: true,
                query: `mutation User($githubId: String!, $token: String!,
									  $githubRepositories: jsonb, $pullRequests: jsonb,
									  $bio: String, $githubBlogUrl: String){
						  update_User(where: {githubId: {_eq: $githubId}},
							_set: {bio: $bio, githubBlogUrl: $githubBlogUrl, githubAccessToken: $token, githubRepositories: $githubRepositories, pullRequests: $pullRequests}) {
							returning {
							  id
							  githubEmail
									  name
									  Companies {
								id
								name
								description
										url
										Industry
										yearFounded
						}

						}
						}
						}`,
                headers: {
                  'X-Hasura-Access-Key': process.env.HASURA_SECRET,
                },
              };
              const checkUserRequestVars = {
                githubId: bodyJson.databaseId + '',
                token: githubToken,
                githubRepositories: bodyJson.repositoriesContributedTo,
                pullRequests: bodyJson.pullRequests,
                bio: bodyJson.bio,
                githubBlogUrl: bodyJson.websiteUrl,
              };
              const client = new grequest.GraphQLClient(
                checkUserRequestopts.uri,
                {
                  headers: checkUserRequestopts.headers,
                },
              );
              console.log(checkUserRequestopts);
              console.log('gt vars', checkUserRequestVars);

              client
                .request(checkUserRequestopts.query, checkUserRequestVars)
                .then(ugdata => {
                  const currentUser = ugdata.update_User.returning[0];
                  if (currentUser && currentUser.id) {
                    currentUser.recruiter = true;
                    var token = jwt.sign(
                      {
                        token: otoken,
                        userId: currentUser.id,
                        github: true,
                        linkedin: false,
                      },
                      process.env.JWT_SECRET,
                      {
                        expiresIn: '200 days', // expires in 24 hours
                      },
                    );
                    /*return originalRes.status(200).send({
                    auth: true,
                    token: token,
                    user: currentUser,
                  });*/
                    req.userId = currentUser.id;
                    req.token = token;
                    req.github = true;
                    req.linkedin = false;
                    req.currentUser = currentUser;
                    next();
                    return;
                  }

                  var uopts = {
                    uri: process.env.HASURA,
                    json: true,
                    query: `mutation insert_User($name: String,
							$githubEmail: String!,
							$githubId: String,
							$githubAvatarUrl: String,
							  $githubUsername: String,
							 $githubAccessToken: String,
							 $githubBlogUrl: String,
							$githubRepositories: jsonb,
							 $githubFollowers: Int,
							$pullRequests: jsonb,
							$bio: String )
							{insert_User(objects: {
							name: $name,
							githubEmail: $githubEmail,
							githubId: $githubId,
							githubAvatarUrl: $githubAvatarUrl,
							githubUsername:  $githubUsername,
							githubAccessToken: $githubAccessToken,
							githubBlogUrl: $githubBlogUrl,
							githubFollowers: $githubFollowers,
							githubRepositories: $githubRepositories,
							pullRequests: $pullRequests,
							bio: $bio

											}){
										returning{
								  id
											  githubEmail
											  name

							}
									}}`,
                    headers: {
                      'X-Hasura-Access-Key': process.env.HASURA_SECRET,
                    },
                  };
                  const client = new grequest.GraphQLClient(uopts.uri, {
                    headers: uopts.headers,
                  });
                  bodyJson.id += '';
                  const variables = {
                    name: bodyJson.name,
                    githubEmail: bodyJson.email,
                    githubId: bodyJson.databaseId + '',
                    githubAvatarUrl: bodyJson.avatarUrl,
                    githubUsername: bodyJson.login,
                    githubAccessToken: githubToken,
                    githubBlogUrl: bodyJson.websiteUrl,
                    pullRequests: bodyJson.pullRequests,
                    bio: bodyJson.bio,
                    githubFollowers: bodyJson.followers.totalCount,
                    githubRepositories: bodyJson.repositoriesContributedTo,
                  };
                  console.log(uopts.query);
                  console.log('gt vars', variables);
                  try {
                    const opts = {
                      uri:
                        'https://api.github.com/user/emails?access_token=' +
                        githubToken,
                      headers: {'User-Agent': 'patcito'},
                    };

                    request(opts, function(err, res, body) {
                      console.log('github email', body);
                      const email = JSON.parse(body)[0].email;
                      variables.githubEmail = email;
                      client.request(uopts.query, variables).then(gdata => {
                        console.log('GDATA', gdata);
                        var token = jwt.sign(
                          {
                            token: otoken,
                            userId: gdata.insert_User.returning[0].id,
                            github: true,
                            linkedin: false,
                          },
                          process.env.JWT_SECRET,
                          {
                            expiresIn: 864000, // expires in 24 hours
                          },
                        );
                        /*return originalRes.status(200).send({
                    auth: true,
                    token: token,
                    user: gdata.insert_User.returning[0],
                  });*/
                        req.userId = gdata.insert_User.returning[0].id;
                        req.token = token;
                        req.github = true;
                        req.linkedin = false;
                        req.currentUser = gdata.insert_User.returning[0];
                        console.log('userid', req.userId);
                        next();
                        return;
                      });
                    });
                  } catch (err) {
                    console.log(err);
                    next();
                    return;
                  }
                  //end client request
                })
                .catch(err => {
                  console.log('err', err);
                });
            });
        } catch (error) {
          console.error('Access Token Error', error.message);
          next();
          return res.status(500).json('Authentication failed');
        }
      } else if (req.query.code.length > 30) {
        console.log('linkedin');
        //github oauth
        const oauth2 = SimpleOauth2.create({
          client: {
            id: process.env.LINKEDIN_ID,
            secret: process.env.LINKEDIN_SECRET,
          },
          auth: {
            tokenHost: 'https://api.linkedin.com',
            tokenPath: '/oauth/v2/accessToken',
            authorizePath: '/oauth/v2/authorization',
          },
        });
        const options = {code: req.query.code};

        try {
          const opts = {
            uri:
              'https://www.linkedin.com/oauth/v2/accessToken?code=' +
              options.code +
              `&grant_type=authorization_code&redirect_uri=${
                process.env.PUBLIC_HOSTNAME
              }&client_id=` +
              process.env.LINKEDIN_ID +
              '&client_secret=' +
              process.env.LINKEDIN_SECRET,
            headers: {
              'Content-Type': 'x-www-form-urlencoded',
            },
          };

          request(opts, function(err, res, body) {
            const otoken = JSON.parse(body).access_token;
            const aopts = {
              uri:
                'https://api.linkedin.com/v1/people/~:(email-address,firstName,lastName,id,headline,siteStandardProfileRequest,industry,picture-url,formatted-name,positions)?format=json',
              headers: {
                Authorization: 'Bearer ' + otoken,
              },
            };
            request(aopts, function(err, res, body) {
              // now body and res.body both will contain decoded content.
              //
              const bodyJson = JSON.parse(body);
              //              console.log('linkedin', bodyJson.positions.values[0]);
              if (req.github === true) {
                console.log('userId!', req.userId);
                const setLinkedinProfilopts = {
                  uri: process.env.HASURA,
                  json: true,
                  query: `mutation uu($id: Int, $linkedinProfile: jsonb!) {
				  update_User(where: {id: {_eq:
					  $id}}, _set: {linkedinProfile: $linkedinProfile}){
					  returning{
						        id
						        linkedinProfile

					  }

				  }

				}`,
                  headers: {
                    'X-Hasura-Access-Key': process.env.HASURA_SECRET,
                  },
                };
                const setLinkedinProfileVars = {
                  linkedinProfile: bodyJson,
                  id: req.userId,
                };
                const client = new grequest.GraphQLClient(
                  setLinkedinProfilopts.uri,
                  {
                    headers: setLinkedinProfilopts.headers,
                  },
                );
                client
                  .request(setLinkedinProfilopts.query, setLinkedinProfileVars)
                  .then(ugdata => {
                    next();
                    return;
                  });
                return;
              } else {
                const checkUserRequestopts = {
                  uri: process.env.HASURA,
                  json: true,
                  query: `query User($linkedinId: String!){
  						User(where: {linkedinId: {_eq: $linkedinId}}) {
						  id
						  linkedinEmail
						  name
						  Companies {
							id
							name
							description
							url
							Industry
							yearFounded
						  }	}
						}`,
                  headers: {
                    'X-Hasura-Access-Key': process.env.HASURA_SECRET,
                  },
                };
                const checkUserRequestVars = {
                  linkedinId: bodyJson.id,
                };
                const client = new grequest.GraphQLClient(
                  checkUserRequestopts.uri,
                  {
                    headers: checkUserRequestopts.headers,
                  },
                );
                client
                  .request(checkUserRequestopts.query, checkUserRequestVars)
                  .then(ugdata => {
                    const currentUser = ugdata.User[0];
                    if (currentUser && currentUser.id) {
                      const token = jwt.sign(
                        {
                          token: otoken,
                          userId: currentUser.id,
                          github: false,
                          linkedin: true,
                        },
                        process.env.JWT_SECRET,
                        {
                          expiresIn: 86400, // expires in 24 hours
                        },
                      );
                      currentUser.recruiter = true;
                      /*return originalRes.status(200).send({
                      auth: true,
                      token: token,
                      user: currentUser,
                    });*/
                      req.userId = currentUser.id;
                      req.token = token;
                      req.github = false;
                      req.linkedin = true;
                      req.currentUser = currentUser;

                      next();
                      return;
                    }
                    const uopts = {
                      uri: process.env.HASURA,
                      json: true,
                      query: `mutation insert_User($name: String,
					$linkedinEmail: String!,
					$linkedinId: String,
					$linkedinAvatarUrl: String,
					 $linkedinAccessToken: String,
					$firstName: String,
					$lastName: String,
					$headlineLinkedin: String,
					$industryLinkedin: String,
					$companyLinkedin: String,
					$linkedinUrl: String,
					  )
					{insert_User(objects: {
					name: $name,
					linkedinEmail: $linkedinEmail,
					linkedinId: $linkedinId,
					linkedinAvatarUrl: $linkedinAvatarUrl,
					linkedinAccessToken: $linkedinAccessToken,
					firstName: $firstName,
					lastName: $lastName,
					headlineLinkedin: $headlineLinkedin,
					industryLinkedin: $industryLinkedin,
					companyLinkedin: $companyLinkedin,
					linkedinUrl: $linkedinUrl,
					}){
					returning{
						  id
						  linkedinEmail
						  name
					}
					}}`,
                      headers: {
                        'X-Hasura-Access-Key': process.env.HASURA_SECRET,
                      },
                    };
                    const variables = {
                      name: bodyJson.formattedName,
                      linkedinEmail: bodyJson.emailAddress,
                      linkedinId: bodyJson.id,
                      linkedinAvatarUrl: bodyJson.pictureUrl,
                      linkedinAccessToken: otoken,
                      firstName: bodyJson.firstName,
                      lastName: bodyJson.lastName,
                      headlineLinkedin: bodyJson.headline,
                      industryLinkedin: bodyJson.industry,
                      companyLinkedin:
                        bodyJson.positions.values[0].company.name,
                      linkedinUrl: bodyJson.siteStandardProfileRequest.url,
                    };
                    client.request(uopts.query, variables).then(gdata => {
                      const currentUser = gdata.insert_User.returning[0];
                      currentUser.recruiter = true;
                      const token = jwt.sign(
                        {
                          token: otoken,
                          userId: currentUser.id,
                          github: false,
                          linkedin: true,
                        },
                        process.env.JWT_SECRET,
                        {
                          expiresIn: 86400, // expires in 24 hours
                        },
                      );

                      /*return originalRes.status(200).send({
                      auth: true,
                      token: token,
                      user: currentUser,
                    });*/
                      req.userId = currentUser.id;
                      req.token = token;
                      req.github = false;
                      req.linkedin = true;
                      req.currentUser = currentUser;
                      next();
                      return;
                    });
                  });
              }
            });
            //    return originalRes.status(500).json(body);
          });
        } catch (error) {
          console.error('Access Token Error Linkedin', error.message);
          next();
          return res.status(500).json('Authentication failed');
        }
      }
    } else {
      next();
      return;
    }
  };
  server.use(auth);
  server.get('/auth', (req, res) => {
    return originalRes.status(200).json({});
  });

  server.get('/checksession', (req, res) => {
    var token = req.headers['x-access-token'];
    if (!token)
      return res.status(401).send({auth: false, message: 'No token provided.'});
    jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
      if (err) {
        return res.status(500).send({
          auth: false,
          message: 'Failed to authenticate token.',
          err: err,
          token: token,
          s: process.env.JWT_SECRET,
        });
      } else {
        return res.status(200).json('ok');
      }
    });
  });

  server.get('/api', (req, res) => {
    var token = req.headers['x-access-token'];
    if (!token) {
      console.log('anon');
      const x = {
        'X-Hasura-Role': 'anon',
      };
      return res.status(200).json(x);
    }

    jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
      if (err) {
        console.log('anon 2');
        const x = {
          'X-Hasura-Role': 'anon',
        };
        return res.status(200).send(x);
      } else {
        var role = req.headers['x-access-role'];
        if (!role) {
          role = decoded.userId ? 'user' : 'anon';
        } else if (role === 'userType') {
          if (decoded.github) {
            role = 'user-candidate';
          } else {
            role = 'user-hr';
          }
        }
        console.log('role', role);
        const x = {
          'X-Hasura-User-Id': decoded.userId + '',
          'X-Hasura-Role': role,
          'X-Hasura-Access-Key': process.env.JWT_SECRET,
          'X-Hasura-Custom': 'custom value',
        };
        return res.status(200).json(x);
      }
    });
  });

  server.get('/jobs/update/:id', (req, res) => {
    return app.render(req, res, '/newjob', {id: req.params.id});
  });

  server.get('/jobs/update/:id/fr', (req, res) => {
    return app.render(req, res, '/newjob', {id: req.params.id, fr: 1});
  });

  server.get('/newjob/fr', (req, res) => {
    return app.render(req, res, '/newjob', {fr: 1});
  });

  server.get('/jobs/companies/:companyId', (req, res) => {
    return app.render(req, res, '/', {companyId: req.params.companyId});
  });

  server.get('/jobs/companies/:companyId/team', (req, res) => {
    return app.render(req, res, '/', {
      companyId: req.params.companyId,
      team: true,
    });
  });

  server.get('/companies', (req, res) => {
    return app.render(req, res, '/', {companies: true});
  });

  server.get('/me/companies', (req, res) => {
    return app.render(req, res, '/', {companies: true, me: true});
  });

  server.get('/companies/:companyId', (req, res) => {
    return app.render(req, res, '/showcompany', {
      companyId: req.params.companyId,
      action: 'showCompany',
    });
  });

  server.get('/jobs/:jobId', (req, res) => {
    return app.render(req, res, '/showjob', {
      jobId: req.params.jobId,
      action: 'showJob',
    });
  });

  server.get('/companies/:companyId/edit', (req, res) => {
    return app.render(req, res, '/editcompany', {
      companyId: req.params.companyId,
      action: 'editCompany',
    });
  });

  server.get('/companies/:companyId/edit/fr', (req, res) => {
    return app.render(req, res, '/editcompany', {
      companyId: req.params.companyId,
      fr: 1,
      action: 'editCompany',
    });
  });

  server.get('/profile/:userProfileId', (req, res) => {
    return app.render(req, res, '/profile', {
      userProfileId: req.params.userProfileId,
      action: 'userProfile',
    });
  });

  server.post('/uploadResume', function(req, res) {
    if (!req.files) return res.status(400).json('No files were uploaded.');
    let sampleFile = req.files.file;

    sampleFile = req.files.file;

    const path =
      '/tmp/' + req.get('jobId') + '-' + req.get('applicantId') + '-resume.pdf';

    sampleFile.mv(path, function(err) {
      if (err) {
        return res.status(500).json(err);
      }
      uploadToGCE(process.env.GOOGLE_STORAGE_BUCKET, path);
      res.send('ok');
    });
  });

  server.post('/upload', function(req, res) {
    if (!req.files) return res.status(400).json('No files were uploaded.');
    let sampleFile = req.files.file;
    const path = '/tmp/' + req.get('companyId') + '-' + req.userId + '-logo';
    sharp(sampleFile.data).toFile(path + '.webp', (err, info) => {
      if (err) {
        res.status(500).json(err);
      }
      sharp(sampleFile.data).toFile(path + '.png', (err, info) => {
        if (err) {
          res.status(500).json(err);
        }
        uploadToGCE(process.env.GOOGLE_STORAGE_BUCKET, path + '.png');

        uploadToGCE(process.env.GOOGLE_STORAGE_BUCKET, path + '.webp');
        console.log(err, info);
        res.status(200).json('ok');
      });
    });
  });

  server.post('/uploadEmployee1Avatar', function(req, res) {
    if (!req.files) return res.status(400).json('No files were uploaded.');
    let sampleFile = req.files.file;
    const path =
      '/tmp/' + req.get('companyId') + '-' + req.userId + '-employee1avatar';
    sharp(sampleFile.data).toFile(path + '.webp', (err, info) => {
      if (err) {
        res.status(500).json(err);
      }
      sharp(sampleFile.data).toFile(path + '.png', (err, info) => {
        if (err) {
          res.status(500).json(err);
        }
        uploadToGCE(process.env.GOOGLE_STORAGE_BUCKET, path + '.png');

        uploadToGCE(process.env.GOOGLE_STORAGE_BUCKET, path + '.webp');
        console.log(err, info);
        res.status(200).json('ok');
      });
    });
  });

  server.post('/uploadEmployee2Avatar', function(req, res) {
    if (!req.files) return res.status(400).json('No files were uploaded.');
    let sampleFile = req.files.file;
    const path =
      '/tmp/' + req.get('companyId') + '-' + req.userId + '-employee2avatar';
    sharp(sampleFile.data).toFile(path + '.webp', (err, info) => {
      if (err) {
        res.status(500).json(err);
      }
      sharp(sampleFile.data).toFile(path + '.png', (err, info) => {
        if (err) {
          res.status(500).json(err);
        }
        uploadToGCE(process.env.GOOGLE_STORAGE_BUCKET, path + '.png');

        uploadToGCE(process.env.GOOGLE_STORAGE_BUCKET, path + '.webp');
        console.log(err, info);
        res.status(200).json('ok');
      });
    });
  });

  server.post('/uploadMedia1Image', function(req, res) {
    if (!req.files) return res.status(400).json('No files were uploaded.');
    let sampleFile = req.files.file;
    const path = '/tmp/' + req.get('companyId') + '-' + req.userId + '-1media';
    sharp(sampleFile.data).toFile(path + '.webp', (err, info) => {
      if (err) {
        res.status(500).json(err);
      }
      sharp(sampleFile.data).toFile(path + '.png', (err, info) => {
        if (err) {
          res.status(500).json(err);
        }
        uploadToGCE(process.env.GOOGLE_STORAGE_BUCKET, path + '.png');

        uploadToGCE(process.env.GOOGLE_STORAGE_BUCKET, path + '.webp');
        console.log(err, info);
        res.status(200).json('ok');
      });
    });
  });

  server.post('/uploadMedia2Image', function(req, res) {
    if (!req.files) return res.status(400).json('No files were uploaded.');
    let sampleFile = req.files.file;
    const path = '/tmp/' + req.get('companyId') + '-' + req.userId + '-2media';
    sharp(sampleFile.data).toFile(path + '.webp', (err, info) => {
      if (err) {
        res.status(500).json(err);
      }
      sharp(sampleFile.data).toFile(path + '.png', (err, info) => {
        if (err) {
          res.status(500).json(err);
        }
        uploadToGCE(process.env.GOOGLE_STORAGE_BUCKET, path + '.png');

        uploadToGCE(process.env.GOOGLE_STORAGE_BUCKET, path + '.webp');
        console.log(err, info);
        res.status(200).json('ok');
      });
    });
  });

  server.post('/uploadMedia3Image', function(req, res) {
    if (!req.files) return res.status(400).json('No files were uploaded.');
    let sampleFile = req.files.file;
    const path = '/tmp/' + req.get('companyId') + '-' + req.userId + '-3media';
    sharp(sampleFile.data).toFile(path + '.webp', (err, info) => {
      if (err) {
        res.status(500).json(err);
      }
      sharp(sampleFile.data).toFile(path + '.png', (err, info) => {
        if (err) {
          res.status(500).json(err);
        }
        uploadToGCE(process.env.GOOGLE_STORAGE_BUCKET, path + '.png');

        uploadToGCE(process.env.GOOGLE_STORAGE_BUCKET, path + '.webp');
        console.log(err, info);
        res.status(200).json('ok');
      });
    });
  });
  server.get('/*logo.png', (req, res) => {
    res.sendFile(staticPath + '/defaultlogo.png');
  });

  server.get('/*avatar.png', (req, res) => {
    res.sendFile(staticPath + '/defaultavatar.png');
  });

  server.get('/*media.png', (req, res) => {
    res.sendFile(staticPath + '/defaultmedia.png');
  });

  server.get('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(process.env);
    console.log(`> Now ready on http://localhost:${port}`);
  });
});
